import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface SectionEditorProps {
  isOpen: boolean;
  onClose: () => void;
  sectionName: string;
  websiteId: number;
  onSectionUpdated: (newHtml: string) => void;
}

export default function SectionEditor({ 
  isOpen, 
  onClose, 
  sectionName, 
  websiteId,
  onSectionUpdated 
}: SectionEditorProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle selecting a section option
  const handleOptionSelect = async (optionIndex: number) => {
    setIsLoading(true);
    
    try {
      // Show loading state
      const loadingToast = toast({
        title: "Updating Section",
        description: `Applying option ${optionIndex + 1} to the ${sectionName} section...`,
        duration: 30000, // Long duration since this might take time
      });
      
      // Call the API to switch section options
      const response = await fetch(`/api/websites/${websiteId}/switch-section`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sectionName,
          optionIndex,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update section');
      }
      
      // Get updated HTML
      const result = await response.json();
      
      // Update parent component with new HTML
      if (result && result.html) {
        onSectionUpdated(result.html);
        
        // Show success message
        toast({
          title: "Section Updated",
          description: `The ${sectionName} section has been updated with option ${optionIndex + 1}.`,
          duration: 3000,
        });
        
        // Close dialog
        onClose();
      }
      
      // Dismiss loading toast
      loadingToast.dismiss();
    } catch (error) {
      console.error('Error updating section:', error);
      toast({
        title: "Error",
        description: "Failed to update section. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit {sectionName} Section</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-600 mb-4">
            Choose one of the design options below for your {sectionName} section:
          </p>
          
          <div className="grid gap-4">
            <div 
              className="border rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-all flex items-center" 
              onClick={() => !isLoading && handleOptionSelect(0)}
            >
              <div className="w-12 h-12 bg-blue-100 flex items-center justify-center rounded-full mr-4">
                <span className="text-xl font-bold text-blue-600">1</span>
              </div>
              <div>
                <h3 className="font-medium">Option 1</h3>
                <p className="text-sm text-gray-500">Default style for this section</p>
              </div>
            </div>
            
            <div 
              className="border rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-all flex items-center" 
              onClick={() => !isLoading && handleOptionSelect(1)}
            >
              <div className="w-12 h-12 bg-blue-100 flex items-center justify-center rounded-full mr-4">
                <span className="text-xl font-bold text-blue-600">2</span>
              </div>
              <div>
                <h3 className="font-medium">Option 2</h3>
                <p className="text-sm text-gray-500">Alternative style and content</p>
              </div>
            </div>
            
            <div 
              className="border rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-all flex items-center" 
              onClick={() => !isLoading && handleOptionSelect(2)}
            >
              <div className="w-12 h-12 bg-blue-100 flex items-center justify-center rounded-full mr-4">
                <span className="text-xl font-bold text-blue-600">3</span>
              </div>
              <div>
                <h3 className="font-medium">Option 3</h3>
                <p className="text-sm text-gray-500">Creative alternative design</p>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            type="button"
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}