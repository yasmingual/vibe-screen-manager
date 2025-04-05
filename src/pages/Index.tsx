
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ContentCard } from "@/components/ContentCard";
import { ContentForm } from "@/components/ContentForm";
import { useContentStore, ContentItem } from "@/lib/store";
import { Plus, Trash2, Monitor, Rss } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { RssFeedDialog } from "@/components/RssFeedDialog";

const Index = () => {
  const { items, addItem, updateItem, removeItem, fetchItems, isLoading } = useContentStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRssDialogOpen, setIsRssDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'content_items'
        },
        () => {
          // Refresh data when changes occur
          console.log('Real-time update received');
          fetchItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchItems]);

  const selectedItem = selectedItemId 
    ? items.find((item) => item.id === selectedItemId) 
    : null;

  const handleAddContent = async (data: Omit<ContentItem, "id" | "createdAt">) => {
    await addItem(data);
    setIsAddDialogOpen(false);
    toast.success("Content added successfully");
  };

  const handleEditContent = async (data: Omit<ContentItem, "id" | "createdAt">) => {
    if (selectedItemId) {
      await updateItem(selectedItemId, data);
      setIsEditDialogOpen(false);
      toast.success("Content updated successfully");
    }
  };

  const handleDeleteContent = async () => {
    if (selectedItemId) {
      await removeItem(selectedItemId);
      setIsDeleteDialogOpen(false);
      toast.success("Content deleted successfully");
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    await updateItem(id, { active });
    toast.success(`Content ${active ? 'activated' : 'deactivated'}`);
  };

  const handleEdit = (id: string) => {
    setSelectedItemId(id);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setSelectedItemId(id);
    setIsDeleteDialogOpen(true);
  };

  const handlePreview = (id: string) => {
    // Find the index of the item
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      // Update the URL with the index
      window.open(`/display?start=${index}`, '_blank');
    }
  };

  const handleImportRss = async (rssItems: Omit<ContentItem, "id" | "createdAt">[]) => {
    // Add all items from the RSS feed
    for (const item of rssItems) {
      await addItem(item);
    }
    return Promise.resolve();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground flex items-center">
            <span className="text-vibrant">Vibe</span>Screen Manager
          </h1>
          <div className="flex space-x-2">
            <Button asChild variant="outline">
              <Link to="/display" target="_blank">
                <Monitor className="h-4 w-4 mr-2" />
                Launch Display
              </Link>
            </Button>
            <Button onClick={() => setIsRssDialogOpen(true)} variant="outline">
              <Rss className="h-4 w-4 mr-2" />
              RSS Feed
            </Button>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Content
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <h2 className="text-2xl font-semibold mb-4">Loading content...</h2>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <h2 className="text-2xl font-semibold mb-4">No content yet</h2>
            <p className="text-muted-foreground mb-6">Start by adding images or videos to your playlist</p>
            <div className="flex gap-4">
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Content
              </Button>
              <Button onClick={() => setIsRssDialogOpen(true)} variant="outline">
                <Rss className="h-4 w-4 mr-2" />
                Import RSS Feed
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <ContentCard
                key={item.id}
                item={item}
                onToggleActive={handleToggleActive}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onPreview={handlePreview}
              />
            ))}
          </div>
        )}
      </main>

      {/* Add Content Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Content</DialogTitle>
            <DialogDescription>
              Upload images or add videos to your display rotation.
            </DialogDescription>
          </DialogHeader>
          <ContentForm 
            onSubmit={handleAddContent} 
            onCancel={() => setIsAddDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Edit Content Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Content</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <ContentForm 
              initialData={selectedItem}
              onSubmit={handleEditContent} 
              onCancel={() => setIsEditDialogOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* RSS Feed Dialog */}
      <RssFeedDialog 
        open={isRssDialogOpen}
        onOpenChange={setIsRssDialogOpen}
        onImport={handleImportRss}
      />

      {/* Delete Content Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this content from your playlist.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteContent} className="bg-destructive text-destructive-foreground">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
