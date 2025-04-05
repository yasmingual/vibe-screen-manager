import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "./ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { ContentItem, ContentType, VideoSource } from "@/lib/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Slider } from "./ui/slider";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Checkbox } from "./ui/checkbox";
import { Upload } from "lucide-react";

const contentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["image", "video"]),
  source: z.union([z.string(), z.instanceof(File)]).optional(),
  videoSource: z.enum(["youtube", "tiktok", "url"]).optional(),
  duration: z.number().min(1, "Duration must be at least 1 second"),
  useVideoDuration: z.boolean().optional().default(true),
  active: z.boolean().default(true),
  leftBackgroundImage: z.union([z.string(), z.instanceof(File)]).optional(),
  rightBackgroundImage: z.union([z.string(), z.instanceof(File)]).optional(),
});

type ContentFormValues = z.infer<typeof contentSchema>;

type ContentFormProps = {
  initialData?: ContentItem;
  onSubmit: (data: ContentFormValues) => void;
  onCancel: () => void;
};

export function ContentForm({ initialData, onSubmit, onCancel }: ContentFormProps) {
  const [contentType, setContentType] = useState<ContentType>(initialData?.type || "image");
  const [videoSource, setVideoSource] = useState<VideoSource | undefined>(initialData?.videoSource || "youtube");
  const [duration, setDuration] = useState(initialData?.duration || 5);
  const [useVideoDuration, setUseVideoDuration] = useState(initialData?.useVideoDuration !== false);
  
  const form = useForm<ContentFormValues>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      title: initialData?.title || "",
      type: initialData?.type || "image",
      source: initialData?.source || "",
      videoSource: initialData?.videoSource || "youtube",
      duration: initialData?.duration || 5,
      useVideoDuration: initialData?.useVideoDuration !== false,
      active: initialData?.active !== false,
      leftBackgroundImage: initialData?.leftBackgroundImage || "",
      rightBackgroundImage: initialData?.rightBackgroundImage || "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title,
        type: initialData.type,
        source: initialData.source,
        videoSource: initialData.videoSource,
        duration: initialData.duration,
        useVideoDuration: initialData.useVideoDuration !== false,
        active: initialData.active !== false,
        leftBackgroundImage: initialData.leftBackgroundImage || "",
        rightBackgroundImage: initialData.rightBackgroundImage || "",
      });
      setContentType(initialData.type);
      setVideoSource(initialData.videoSource);
      setDuration(initialData.duration);
      setUseVideoDuration(initialData.useVideoDuration !== false);
    }
  }, [initialData, form]);

  const handleSubmit = (values: ContentFormValues) => {
    const processFile = async (file: File | string | undefined): Promise<string> => {
      if (file instanceof File) {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              resolve(e.target.result as string);
            }
          };
          reader.readAsDataURL(file);
        });
      }
      return file || "";
    };

    const processFormData = async () => {
      const processedValues = { ...values };
      
      if (values.type === "image" && values.source instanceof File) {
        processedValues.source = await processFile(values.source);
      }
      
      if (values.leftBackgroundImage instanceof File) {
        processedValues.leftBackgroundImage = await processFile(values.leftBackgroundImage);
      }
      
      if (values.rightBackgroundImage instanceof File) {
        processedValues.rightBackgroundImage = await processFile(values.rightBackgroundImage);
      }
      
      onSubmit(processedValues);
    };

    processFormData();
  };

  const handleContentTypeChange = (value: string) => {
    const newType = value as ContentType;
    setContentType(newType);
    form.setValue("type", newType);
    
    if (newType === "video" && !videoSource) {
      setVideoSource("youtube");
      form.setValue("videoSource", "youtube");
    }
  };

  const handleVideoSourceChange = (value: string) => {
    const newSource = value as VideoSource;
    setVideoSource(newSource);
    form.setValue("videoSource", newSource);
  };

  const handleDurationChange = (value: number[]) => {
    const newDuration = value[0];
    setDuration(newDuration);
    form.setValue("duration", newDuration);
  };

  const handleUseVideoDurationChange = (checked: boolean) => {
    setUseVideoDuration(checked);
    form.setValue("useVideoDuration", checked);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Digite o título do conteúdo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem className="space-y-2">
          <FormLabel>Tipo de Conteúdo</FormLabel>
          <Tabs
            defaultValue={contentType}
            onValueChange={handleContentTypeChange}
            className="w-full"
            value={contentType}
          >
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="image">Imagem</TabsTrigger>
              <TabsTrigger value="video">Vídeo</TabsTrigger>
            </TabsList>
            <TabsContent value="image" className="pt-4">
              <FormField
                control={form.control}
                name="source"
                render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem>
                    <FormLabel>Fonte da Imagem</FormLabel>
                    <FormControl>
                      <div className="flex flex-col space-y-2">
                        <RadioGroup
                          defaultValue="url"
                          className="flex flex-col space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="url" id="image-url" />
                            <label htmlFor="image-url">URL</label>
                          </div>
                          <Input 
                            placeholder="Digite a URL da imagem" 
                            onChange={(e) => {
                              onChange(e.target.value);
                            }}
                            value={typeof value === 'string' ? value : ''}
                            className="ml-6"
                          />
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="upload" id="image-upload" />
                            <label htmlFor="image-upload">Upload</label>
                          </div>
                          <div className="ml-6">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  onChange(file);
                                }
                              }}
                            />
                          </div>
                        </RadioGroup>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
            <TabsContent value="video" className="pt-4">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="videoSource"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fonte do Vídeo</FormLabel>
                      <FormControl>
                        <RadioGroup
                          defaultValue={videoSource}
                          onValueChange={handleVideoSourceChange}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-1">
                            <RadioGroupItem value="youtube" id="youtube" />
                            <label htmlFor="youtube">YouTube</label>
                          </div>
                          <div className="flex items-center space-x-1">
                            <RadioGroupItem value="tiktok" id="tiktok" />
                            <label htmlFor="tiktok">TikTok</label>
                          </div>
                          <div className="flex items-center space-x-1">
                            <RadioGroupItem value="url" id="url" />
                            <label htmlFor="url">URL</label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL do Vídeo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            videoSource === "youtube"
                              ? "https://www.youtube.com/watch?v=..."
                              : videoSource === "tiktok"
                              ? "https://www.tiktok.com/@user/video/..."
                              : "Digite a URL do vídeo"
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="leftBackgroundImage"
                  render={({ field: { onChange, value, ...rest } }) => (
                    <FormItem>
                      <FormLabel>Imagem de fundo (lado esquerdo)</FormLabel>
                      <FormControl>
                        <div className="flex flex-col space-y-2">
                          <Input
                            placeholder="URL da imagem de fundo à esquerda"
                            onChange={(e) => {
                              onChange(e.target.value);
                            }}
                            value={typeof value === 'string' ? value : ''}
                          />
                          <div className="flex items-center space-x-2">
                            <Upload className="h-4 w-4" />
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  onChange(file);
                                }
                              }}
                            />
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rightBackgroundImage"
                  render={({ field: { onChange, value, ...rest } }) => (
                    <FormItem>
                      <FormLabel>Imagem de fundo (lado direito)</FormLabel>
                      <FormControl>
                        <div className="flex flex-col space-y-2">
                          <Input
                            placeholder="URL da imagem de fundo à direita"
                            onChange={(e) => {
                              onChange(e.target.value);
                            }}
                            value={typeof value === 'string' ? value : ''}
                          />
                          <div className="flex items-center space-x-2">
                            <Upload className="h-4 w-4" />
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  onChange(file);
                                }
                              }}
                            />
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="useVideoDuration"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            handleUseVideoDurationChange(checked === true);
                          }}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Usar duração real do vídeo
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Quando ativado, o sistema usará o tempo real do vídeo
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>
          </Tabs>
        </FormItem>

        {(contentType !== 'video' || !useVideoDuration) && (
          <FormField
            control={form.control}
            name="duration"
            render={({ field: { onChange, ...rest } }) => (
              <FormItem>
                <FormLabel>Duração de exibição (segundos): {duration}</FormLabel>
                <FormControl>
                  <Slider
                    defaultValue={[duration]}
                    min={1}
                    max={60}
                    step={1}
                    onValueChange={handleDurationChange}
                    value={[duration]}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {initialData ? "Atualizar" : "Adicionar"} Conteúdo
          </Button>
        </div>
      </form>
    </Form>
  );
}
