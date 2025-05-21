import React, { useState, useRef, useEffect } from "react";
import { Send, Image as ImageIcon, ExternalLink, RefreshCw, AlertTriangle, Facebook, Instagram, Twitter, Linkedin, Youtube } from "lucide-react";
import { useChat } from "@/hooks/use-chat";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import WebsitePreview from "@/components/WebsitePreview";
import ViewWebsiteButton from "@/components/ViewWebsiteButton";
import { useWebsiteGeneration } from "../contexts/WebsiteGenerationContext";
import { useLocation } from "wouter";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SimpleChat() {
  // Chat state
  const [inputMessage, setInputMessage] = useState("");
  const [showWebsitePreview, setShowWebsitePreview] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  
  // Social media dialog state
  const [showSocialMediaDialog, setShowSocialMediaDialog] = useState(false);
  const [socialMedia, setSocialMedia] = useState({
    facebook: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    youtube: "",
    tiktok: ""
  });
  
  // Other state
  const { startGeneration } = useWebsiteGeneration();
  const [uploadMode, setUploadMode] = useState<"chat" | "review">("chat");
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [_, navigate] = useLocation();
  
  // Chat hooks
  const {
    messages,
    isLoading,
    sendMessage: send,
    handleImageUpload,
    uploadedImages,
    websiteStructure,
    isGeneratingWebsite: isGenerating,
    socialMediaLinks,
    generateWebsiteContent,
    editWebsiteContent,
    resetChat,
    resetAll
  } = useChat();

  // Function to handle social media form submission
  const handleSocialMediaSubmit = () => {
    // Filter out empty values
    const nonEmptySocials = Object.entries(socialMedia)
      .filter(([_, value]) => value.trim() !== '')
      .map(([platform, value]) => `${platform}: ${value}`)
      .join(', ');
    
    if (nonEmptySocials) {
      setInputMessage(`Our social media accounts are: ${nonEmptySocials}`);
    }
    setShowSocialMediaDialog(false);
  };

  // Function to send message
  const sendMessage = async () => {
    if (inputMessage.trim()) {
      await send(inputMessage.trim());
      setInputMessage("");
    }
  };

  // Function to handle file upload
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const files = Array.from(event.target.files);
      try {
        await handleImageUpload(files);
        event.target.value = ""; // Reset the input
        
        // Skip directly to generation - no intermediate screen
        navigate("/generating-website");
        startGeneration(1); // Use website ID 1
      } catch (error) {
        console.error("Error uploading images:", error);
        toast({
          variant: "destructive",
          title: "Upload failed",
          description: "There was an error uploading your images. Please try again.",
        });
      }
    }
  };

  // Function to handle website generation
  const handleGenerateWebsite = async () => {
    try {
      startGeneration();
      navigate("/generating-website");
    } catch (error) {
      console.error("Error starting website generation:", error);
      toast({
        variant: "destructive",
        title: "Website Generation Failed",
        description: "There was an error generating your website. Please try again.",
      });
    }
  };

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Keydown handler for enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Handle reset confirmation
  const confirmReset = async () => {
    await resetAll();
    setResetConfirmOpen(false);
    toast({
      title: "Reset Complete",
      description: "All data has been cleared. You can start fresh now.",
    });
  };

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b">
        <h1 className="text-xl font-semibold">Instant Website</h1>
        <div className="flex items-center space-x-2">
          {websiteStructure && (
            <ViewWebsiteButton onClick={() => setShowWebsitePreview(true)} />
          )}
          <button
            onClick={() => setResetConfirmOpen(true)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            aria-label="Reset chat"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, i) => (
          <div
            key={i}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === "user"
                  ? "bg-blue-500 text-white rounded-br-none"
                  : "bg-gray-200 text-gray-800 rounded-bl-none"
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              
              {/* Display images if any */}
              {message.images && message.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {message.images.map((img, i) => (
                    <img
                      key={i}
                      src={img.url}
                      alt={`Uploaded content ${i + 1}`}
                      className="rounded-md max-h-40 w-auto"
                    />
                  ))}
                </div>
              )}
              
              {/* Loading indicator */}
              {message.isLoading && (
                <div className="flex items-center mt-2">
                  <div className="animate-pulse flex space-x-1">
                    <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                    <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                    <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>

      {/* Message Input */}
      <div className="border-t p-4">
        <div className="relative">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full p-3 pr-24 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-32 resize-none"
            placeholder="Type your message..."
            rows={1}
          />
          
          <div className="absolute right-16 top-1/2 transform -translate-y-1/2 flex space-x-3">
            {/* Upload Image Button */}
            <label 
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 cursor-pointer"
              title="Upload images"
            >
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <ImageIcon className="h-5 w-5 text-blue-500" />
            </label>
            
            {/* Social Media Button */}
            <button
              onClick={() => setShowSocialMediaDialog(true)}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
              title="Add social media links"
            >
              <Facebook className="h-5 w-5 text-blue-500" />
            </button>
            
            {/* Send Button */}
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim()}
              className="absolute right-1 w-10 h-10 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: inputMessage.trim() ? '#3b82f6' : '#d1d5db' }}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Generate Website Button */}
      {uploadedImages.length > 0 && (
        <div className="p-4 pt-0">
          <Button 
            onClick={handleGenerateWebsite} 
            disabled={isGenerating} 
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            {isGenerating ? "Generating..." : "Create Your Website"}
          </Button>
        </div>
      )}
      
      {/* Reset Confirmation Dialog */}
      <AlertDialog open={resetConfirmOpen} onOpenChange={setResetConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete all your chat messages, uploaded images, and website data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReset}>
              Reset Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Website Preview Dialog */}
      {websiteStructure && showWebsitePreview && (
        <WebsitePreview 
          structure={websiteStructure} 
          onClose={() => setShowWebsitePreview(false)}
          onEdit={editWebsiteContent}
        />
      )}
      
      {/* Social Media Dialog */}
      <Dialog open={showSocialMediaDialog} onOpenChange={setShowSocialMediaDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Your Social Media Links</DialogTitle>
            <DialogDescription>
              Enter your business social media accounts below to include them on your website.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Facebook className="h-5 w-5 text-blue-600" />
              <div className="col-span-3">
                <Input 
                  placeholder="facebook.com/yourbusiness" 
                  value={socialMedia.facebook}
                  onChange={(e) => setSocialMedia({...socialMedia, facebook: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Instagram className="h-5 w-5 text-pink-600" />
              <div className="col-span-3">
                <Input 
                  placeholder="instagram.com/yourbusiness" 
                  value={socialMedia.instagram}
                  onChange={(e) => setSocialMedia({...socialMedia, instagram: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Twitter className="h-5 w-5 text-blue-400" />
              <div className="col-span-3">
                <Input 
                  placeholder="twitter.com/yourbusiness" 
                  value={socialMedia.twitter}
                  onChange={(e) => setSocialMedia({...socialMedia, twitter: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Linkedin className="h-5 w-5 text-blue-700" />
              <div className="col-span-3">
                <Input 
                  placeholder="linkedin.com/company/yourbusiness" 
                  value={socialMedia.linkedin}
                  onChange={(e) => setSocialMedia({...socialMedia, linkedin: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Youtube className="h-5 w-5 text-red-600" />
              <div className="col-span-3">
                <Input 
                  placeholder="youtube.com/@yourbusiness" 
                  value={socialMedia.youtube}
                  onChange={(e) => setSocialMedia({...socialMedia, youtube: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <svg className="h-5 w-5 text-black" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
              <div className="col-span-3">
                <Input 
                  placeholder="tiktok.com/@yourbusiness" 
                  value={socialMedia.tiktok}
                  onChange={(e) => setSocialMedia({...socialMedia, tiktok: e.target.value})}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-start">
            <Button 
              type="button" 
              variant="default" 
              onClick={handleSocialMediaSubmit}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Add to Chat
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}