import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, MessageSquare, Zap, Shield } from 'lucide-react';

interface TipsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TipsModal({ isOpen, onClose }: TipsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">💡 Tips for Best Results</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Camera className="w-5 h-5 text-blue-600 mt-1" />
            <div>
              <h4 className="font-medium">High-Quality Images</h4>
              <p className="text-sm text-gray-600">Use clear, well-lit photos that showcase your business best</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-green-600 mt-1" />
            <div>
              <h4 className="font-medium">Be Specific</h4>
              <p className="text-sm text-gray-600">Detailed descriptions help create more accurate websites</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-yellow-600 mt-1" />
            <div>
              <h4 className="font-medium">Generation Time</h4>
              <p className="text-sm text-gray-600">Your website will be ready in 60-90 seconds</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-purple-600 mt-1" />
            <div>
              <h4 className="font-medium">Your Data is Safe</h4>
              <p className="text-sm text-gray-600">Images and information are only used to create your website</p>
            </div>
          </div>
        </div>
        
        <Button onClick={onClose} className="w-full mt-4">
          Got it, let's create my website!
        </Button>
      </DialogContent>
    </Dialog>
  );
}