import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Send, Image as ImageIcon, Zap, MessageSquare, LayoutTemplate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChat } from '@/hooks/use-chat';
import { UploadedImage, Message } from '@/types';
import ImageUpload from '@/components/ImageUpload';
import { useToast } from '@/hooks/use-toast';

export default function ChatPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState('');
  const [isImageUploadOpen, setIsImageUploadOpen] = useState(false);
  const [showSkipButton, setShowSkipButton] = useState(true);
  
  const {
    messages,
    isLoading,
    uploadedImages,
    sendMessage,
    handleImageUpload,
    clearUploadedImages,
  } = useChat();

  const handleRemoveImage = (index: number) => {
    if (uploadedImages) {
      const newImages = [...uploadedImages];
      newImages.splice(index, 1);
      clearUploadedImages();
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    // Use a small delay to ensure DOM has updated
    const timer = setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end',
          inline: 'nearest'
        });
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [messages, isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };
  
  // Function to skip the current question
  const handleSkip = () => {
    console.log("Skip button clicked!");
    sendMessage("Skip this question");
    // Show a toast to inform the user
    toast({
      title: "Question skipped",
      description: "Moving to the next question",
    });
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="flex items-center p-4 border-b border-gray-200 shadow-sm bg-white">
        <Button
          onClick={() => navigate('/')}
          variant="ghost"
          size="icon"
          className="rounded-full mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white mr-2">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h1 className="font-semibold">Website Designer</h1>
            <p className="text-xs text-gray-500">Describe your website</p>
          </div>
        </div>

        <Button 
          onClick={() => navigate('/website')}
          className="ml-auto bg-blue-500 text-white rounded-full"
          size="sm"
          disabled={uploadedImages.length === 0}
        >
          Next
        </Button>
      </header>

      {/* Chat Messages */}
      <div className="flex-grow overflow-y-auto p-4 custom-scrollbar bg-gray-50">
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.length === 0 ? (
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 my-4">
              <h2 className="font-medium text-gray-800 mb-1">Welcome!</h2>
              <p className="text-gray-600 text-sm">
                I'm your AI website designer. Tell me about the website you want to create, 
                and upload some images to help me understand your vision.
              </p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex flex-col items-start w-full">
                  <div
                    className={`rounded-lg p-3 ${
                      msg.role === 'user'
                        ? 'bg-blue-500 text-white rounded-br-none ml-auto'
                        : 'bg-white border border-gray-200 rounded-bl-none'
                    } ${msg.role === 'user' ? 'max-w-[80%]' : 'max-w-[80%]'}`}
                  >
                    {msg.content}
                    
                    {/* Display uploaded images */}
                    {msg.images && msg.images.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {msg.images.map((img, imgIndex) => (
                          <div key={imgIndex} className="rounded-md overflow-hidden border border-gray-200">
                            <img 
                              src={img.url} 
                              alt={`Uploaded ${imgIndex + 1}`}
                              className="max-w-full h-auto"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Removed skip button here to test */}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Image Upload Area (conditionally rendered) */}
      {isImageUploadOpen && (
        <div className="p-3 bg-gray-50 border-t border-gray-200">
          <ImageUpload
            onUpload={handleImageUpload}
            uploadedImages={uploadedImages}
            onRemoveImage={handleRemoveImage}
            isVisible={true}
            onToggleVisible={() => setIsImageUploadOpen(false)}
          />
        </div>
      )}

      {/* Chat Input */}
      <div className="p-3 bg-white border-t border-gray-200">
        {/* Skip button removed as requested */}
        
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Button
            type="button"
            onClick={() => setIsImageUploadOpen(!isImageUploadOpen)}
            variant="outline"
            size="icon"
            className="rounded-full flex-shrink-0"
          >
            <ImageIcon className="h-5 w-5 text-blue-500" />
          </Button>
          
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your business website..."
            className="flex-grow bg-gray-100 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
          
          <Button
            type="submit"
            disabled={!message.trim()}
            className="rounded-full bg-blue-500 flex-shrink-0"
            size="icon"
          >
            <Send className="h-5 w-5 text-white" />
          </Button>
        </form>
        
        {uploadedImages.length > 0 && (
          <div className="mt-2 py-1 px-1 w-full overflow-hidden">
            <div className="flex overflow-x-auto pb-2 no-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
              {uploadedImages.map((image, index) => (
                <div key={index} className="relative flex-shrink-0 mr-2">
                  <img
                    src={image.url}
                    alt={`Uploaded ${index + 1}`}
                    className="h-12 w-12 object-cover rounded"
                  />
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                    aria-label="Remove image"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Skip button is now directly under each message */}
      
      {/* Generate Website Button - only show after images are uploaded */}
      {uploadedImages.length > 0 && (
        <div className="flex justify-center my-4">
          <button 
            type="button"
            onClick={() => navigate('/website')}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <LayoutTemplate className="h-5 w-5" />
            Generate Website
          </button>
        </div>
      )}

      {/* Bottom navigation bar (only on mobile) */}
      <div className="sm:hidden bg-white border-t border-gray-200 py-2 px-4 flex justify-center">
        <div className="flex gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="flex-col text-xs"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-5 w-5 mb-1" />
            Home
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex-col text-xs text-blue-500 border-t-2 border-blue-500 rounded-none"
          >
            <MessageSquare className="h-5 w-5 mb-1" />
            Chat
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex-col text-xs"
            onClick={() => navigate('/website')}
            disabled={uploadedImages.length === 0}
          >
            <LayoutTemplate className="h-5 w-5 mb-1" />
            Website
          </Button>
        </div>
      </div>
    </div>
  );
}