
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
import { useState } from "react";
import { toast } from "sonner";

const contentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["image", "video"]),
  source: z.string().min(1, "Source is required"),
  videoSource: z.enum(["youtube", "tiktok", "url"]).optional(),
  duration: z.number().min(1, "Duration must be at least 1 second"),
  active: z.boolean().default(true),
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
  
  const form = useForm<ContentFormValues>({
    resolver: zodResolver(contentSchema),
    defaultValues: initialData || {
      title: "",
      type: "image",
      source: "",
      videoSource: "youtube",
      duration: 5,
      active: true,
    },
  });

  const handleSubmit = (values: ContentFormValues) => {
    // For image uploads, handle file input
    if (values.type === "image" && typeof values.source === "object" && values.source instanceof FileList) {
      const file = values.source[0];
      if (!file) {
        toast.error("Please select an image file");
        return;
      }
      
      // Convert to data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        onSubmit({
          ...values,
          source: e.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    } else {
      onSubmit(values);
    }
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter content title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem className="space-y-2">
          <FormLabel>Content Type</FormLabel>
          <Tabs
            defaultValue={contentType}
            onValueChange={handleContentTypeChange}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="image">Image</TabsTrigger>
              <TabsTrigger value="video">Video</TabsTrigger>
            </TabsList>
            <TabsContent value="image" className="pt-4">
              <FormField
                control={form.control}
                name="source"
                render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem>
                    <FormLabel>Image Source</FormLabel>
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
                            placeholder="Enter image URL" 
                            onChange={(e) => {
                              onChange(e.target.value);
                            }}
                            value={typeof value === 'string' ? value : ''}
                            className="ml-6"
                          />
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
                      <FormLabel>Video Source</FormLabel>
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
                            <label htmlFor="url">Other URL</label>
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
                      <FormLabel>Video URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            videoSource === "youtube"
                              ? "https://www.youtube.com/watch?v=..."
                              : videoSource === "tiktok"
                              ? "https://www.tiktok.com/@user/video/..."
                              : "Enter video URL"
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>
          </Tabs>
        </FormItem>

        <FormField
          control={form.control}
          name="duration"
          render={({ field: { onChange, ...rest } }) => (
            <FormItem>
              <FormLabel>Display Duration (seconds): {duration}</FormLabel>
              <FormControl>
                <Slider
                  defaultValue={[duration]}
                  min={1}
                  max={60}
                  step={1}
                  onValueChange={handleDurationChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? "Update" : "Add"} Content
          </Button>
        </div>
      </form>
    </Form>
  );
}
