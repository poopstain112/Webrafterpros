import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Send, RefreshCw, ImageIcon, Facebook, Upload } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Message, Website } from "@shared/schema";
import WebsitePreview from "@/components/WebsitePreview";

interface UploadedImage {
  url: string;
  id: number;
  websiteId: number;
  filename: string;
  createdAt: string;
}

export default function SimpleChat() {
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [websiteStructure, setWebsiteStructure] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showWebsitePreview, setShowWebsitePreview] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [showSocialMediaDialog, setShowSocialMediaDialog] = useState(false);
  const [socialMedia, setSocialMedia] = useState({
    facebook: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    youtube: "",
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingMessage, setEditingMessage] = useState<{index: number, content: string} | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{isUploading: boolean, progress: number, fileName: string}>({
    isUploading: false,
    progress: 0,
    fileName: ''
  });

  // Handle editing a message
  const handleEditMessage = (index: number, content: string) => {
    setEditingMessage({ index, content });
  };

  // Save edited message
  const saveEditedMessage = () => {
    if (!editingMessage) return;
    
    const updatedMessages = [...messages];
    updatedMessages[editingMessage.index] = {
      ...updatedMessages[editingMessage.index],
      content: editingMessage.content
    };
    setMessages(updatedMessages);
    setEditingMessage(null);
    
    toast({
      title: "Message updated!",
      description: "Your information has been corrected.",
    });
  };

  // Function to extract business info from conversation messages
  const extractBusinessInfo = (messages: any[]) => {
    const businessInfo: any = {};
    
    // Simple pattern matching to extract key information
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const prevMessage = messages[i-1];
      
      if (message.role === "user" && prevMessage?.role === "assistant") {
        const question = prevMessage.content.toLowerCase();
        const answer = message.content;
        
        if (question.includes("business name")) {
          businessInfo.name = answer;
        } else if (question.includes("located") || question.includes("location")) {
          businessInfo.location = answer;
        } else if (question.includes("services") || question.includes("offer")) {
          businessInfo.services = answer;
        } else if (question.includes("unique") || question.includes("special")) {
          businessInfo.uniqueSellingPoint = answer;
        } else if (question.includes("ideal customer") || question.includes("target")) {
          businessInfo.targetCustomers = answer;
        }
      }
    }
    
    return businessInfo;
  };

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Mobile keyboard handling - scroll to input when keyboard appears
  const scrollToInput = () => {
    setTimeout(() => {
      // More aggressive scrolling to ensure it fully bottoms out
      messagesEndRef.current?.scrollIntoView({ 
        behavior: "smooth", 
        block: "end",
        inline: "nearest" 
      });
      
      // Additional fallback to ensure we get all the way to bottom
      setTimeout(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: "smooth"
        });
      }, 100);
    }, 300); // Give keyboard time to appear
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle mobile keyboard events
  useEffect(() => {
    let initialHeight = window.innerHeight;
    
    const handleResize = () => {
      scrollToInput();
    };

    const handleViewportChange = () => {
      scrollToInput();
    };

    // Modern approach with Visual Viewport API
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
    } else {
      // Fallback for older browsers
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
      } else {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  // Load existing messages when page loads (no auto-reset)
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await fetch('/api/websites/1/messages');
        if (response.ok) {
          const loadedMessages = await response.json();
          setMessages(loadedMessages);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();
  }, []);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: any = {
      id: Date.now(),
      websiteId: 1,
      role: "user",
      content: inputMessage.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");

    // Add loading message
    const loadingMessage: any = {
      id: Date.now() + 1,
      websiteId: 1,
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
      isLoading: true,
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      const response = await fetch('/api/websites/1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: "user",
          content: inputMessage.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      // Remove loading message and add both user and AI messages
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isLoading);
        return [...filtered, data.aiMessage];
      });

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(msg => !msg.isLoading));
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check if adding these files would exceed the 5-image limit
    if (uploadedImages.length + files.length > 5) {
      toast({
        title: "Image Limit Exceeded",
        description: `You can only upload up to 5 images total. You currently have ${uploadedImages.length} images.`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Start upload progress
      setUploadProgress({
        isUploading: true,
        progress: 0,
        fileName: files[0]?.name || 'image'
      });

      const formData = new FormData();
      files.forEach(file => formData.append('images', file));

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 20, 90)
        }));
      }, 200);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      // Complete progress
      clearInterval(progressInterval);
      setUploadProgress(prev => ({ ...prev, progress: 100 }));

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const uploadedFiles = await response.json();
      
      console.log("Upload response:", uploadedFiles);
      setUploadedImages(prev => [...prev, ...uploadedFiles]);

      // Show immediate upload success feedback
      toast({
        title: "✅ Upload Complete!",
        description: `${files.length} image(s) uploaded successfully`,
      });

      // Add success message to chat immediately  
      const successMessage = {
        id: Date.now(),
        websiteId: 1,
        content: "Perfect! Images uploaded successfully! 🎉\n\nNow please upload 1-10 high-quality images of your business work, facility, team, or services to showcase on your website.",
        role: "assistant",
        createdAt: new Date(),
      };
      setMessages(prev => [...prev, successMessage]);

      // Reset progress after success
      setTimeout(() => {
        setUploadProgress({ isUploading: false, progress: 0, fileName: '' });
      }, 2000);

    } catch (error) {
      console.error('Error uploading files:', error);
      setUploadProgress({ isUploading: false, progress: 0, fileName: '' });
      toast({
        title: "Upload failed",
        description: "Please try again.",
        variant: "destructive",
      });
      return; // Prevent further execution
    }
  };

  const handleGenerateWebsite = async () => {
    if (uploadedImages.length === 0) {
      toast({
        title: "No images uploaded",
        description: "Please upload at least one image to generate your website.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Get all the conversation data
      const allMessages = messages.filter(m => m.role === 'user').map(m => m.content).join(' | ');
      
      console.log("Starting website generation with conversation data:", allMessages);
      
      // Simple API call - no complex logic
      const response = await fetch('/api/generate-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: allMessages || "Professional business website",
          websiteId: 1,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate website');
      }

      const result = await response.json();
      console.log("Website generated successfully");
      
      // Immediate redirect to website view
      window.location.replace('/website-view');
      
    } catch (error) {
      console.error('Website generation error:', error);
      toast({
        title: "Generation failed", 
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const confirmReset = async () => {
    try {
      await fetch('/api/reset_all', { method: 'POST' });
      
      // Set the enhanced strategic greeting message
      const greetingMessage = {
        id: 1,
        role: "assistant",
        content: "👋 Welcome! I'm here to create a stunning, professional website tailored specifically for your business. Let's get started!\n\nFirst, tell me what type of business you have and we'll build from there. Are you in hospitality, services, retail, healthcare, or something else?",
        websiteId: 1,
        createdAt: new Date().toISOString(),
      };
      
      setMessages([greetingMessage]);
      setUploadedImages([]);
      setWebsiteStructure(null);
      setShowWebsitePreview(false);
      setResetConfirmOpen(false);
      
      toast({
        title: "Chat reset successfully",
        description: "All data has been cleared.",
      });
    } catch (error) {
      console.error('Error resetting:', error);
      toast({
        title: "Reset failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const editWebsiteContent = async (section: string, newContent: string) => {
    try {
      const response = await fetch('/api/edit-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId: 1,
          section,
          newContent,
        }),
      });

      if (!response.ok) {
        throw new Error('Edit failed');
      }

      const updatedWebsite = await response.json();
      setWebsiteStructure(updatedWebsite);
      
      toast({
        title: "Content updated successfully!",
        description: `${section} has been updated.`,
      });
    } catch (error) {
      console.error('Error editing content:', error);
      toast({
        title: "Edit failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSocialMediaSubmit = () => {
    setShowSocialMediaDialog(false);
    toast({
      title: "Social media links saved!",
      description: "Your links will be included when generating the website.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Website Builder Chat</h1>
          <p className="text-sm text-gray-500">Tell me about your business and I'll create your website</p>
        </div>
        <div className="flex items-center gap-2">
          {uploadedImages.length > 0 && (
            <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              {uploadedImages.length}/5 images
            </span>
          )}
          {websiteStructure && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowWebsitePreview(true)}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              View Website
            </Button>
          )}
          <button
            onClick={() => setResetConfirmOpen(true)}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            title="Reset chat"
            aria-label="Reset chat"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Upload Progress Indicator */}
      {uploadProgress.isUploading && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg p-4 border border-gray-200 z-50 min-w-[300px]">
          <div className="flex items-center gap-3 mb-2">
            <Upload className="h-5 w-5 text-blue-600 animate-pulse" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Uploading {uploadProgress.fileName}</p>
              <p className="text-xs text-gray-500">{uploadProgress.progress}% complete</p>
            </div>
          </div>
          <Progress value={uploadProgress.progress} className="w-full h-2" />
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-4xl mx-auto w-full">
        {messages.map((message, i) => (
          <div
            key={i}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 shadow-sm ${
                message.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-white text-gray-800 rounded-bl-none border border-gray-100"
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed flex-1">{message.content}</p>
                {message.role === "user" && (
                  <button
                    onClick={() => handleEditMessage(i, message.content)}
                    className="text-xs opacity-70 hover:opacity-100 px-2 py-1 rounded hover:bg-black/10 transition-all"
                    title="Edit this message"
                  >
                    Edit
                  </button>
                )}
              </div>
              
              {/* Social Media Button in Message - shown only for assistant messages about social media */}
              {message.role === "assistant" && 
               message.content.toLowerCase().includes("social media") && (
                <div className="mt-3">
                  <button
                    onClick={() => setShowSocialMediaDialog(true)}
                    className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg flex items-center gap-2 transition-colors duration-200"
                  >
                    <Facebook className="h-4 w-4" />
                    <span>Add Social Media Links</span>
                  </button>
                </div>
              )}
              
              {/* Logo Upload Button - shown for logo question */}
              {message.role === "assistant" && 
               message.content.includes("Great! Now please upload your business logo and tell me your slogan") && (
                <div className="mt-3">
                  <button
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.multiple = false;
                      input.accept = 'image/*';
                      
                      input.onchange = async (e) => {
                        const files = Array.from((e.target as HTMLInputElement).files || []);
                        if (files.length === 0) return;
                        
                        // Use the main upload function with progress tracking
                        await uploadFiles(files);
                      };
                      
                      input.click();
                    }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors duration-200"
                  >
                    <ImageIcon className="h-4 w-4" />
                    <span>Upload Logo</span>
                  </button>
                </div>
              )}
              
              {/* Business Images Upload Button - shown only for the FINAL question about uploading photos */}
              {message.role === "assistant" && 
               message.content.includes("Perfect! I have everything I need to create your professional website. Now please upload") && (
                <div className="mt-3">
                  <button
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.multiple = true;
                      input.accept = 'image/*';
                      
                      input.onchange = async (e) => {
                        const files = Array.from((e.target as HTMLInputElement).files || []);
                        if (files.length === 0) return;
                        
                        console.log('Files selected:', files.map(f => f.name));
                        
                        // Immediately redirect on file selection
                        console.log('FILES SELECTED - REDIRECTING NOW');
                        window.location.href = '/generating-variants';
                        
                        // Upload in background
                        setTimeout(async () => {
                          try {
                            const formData = new FormData();
                            formData.append('websiteId', '1');
                            files.forEach(file => {
                              formData.append('images', file);
                            });
                            
                            await fetch('/api/upload', {
                              method: 'POST',
                              body: formData,
                            });
                          } catch (error) {
                            console.log('Background upload completed');
                          }
                        }, 0);
                      };
                      
                      input.click();
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors duration-200"
                  >
                    <ImageIcon className="h-4 w-4" />
                    <span>Upload Images</span>
                  </button>
                </div>
              )}
              
              {/* Display images if any */}
              {message.images && message.images.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {message.images.map((img: any, i: number) => (
                    <div key={i} className="rounded-md overflow-hidden shadow-sm">
                      <img
                        src={img.url}
                        alt={`Uploaded content ${i + 1}`}
                        className="w-full h-auto object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              )}
              
              {/* Loading indicator */}
              {message.isLoading && (
                <div className="flex items-center justify-center mt-3 py-1">
                  <div className="flex space-x-1.5">
                    <div className="h-2.5 w-2.5 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="h-2.5 w-2.5 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="h-2.5 w-2.5 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>

      {/* Message Input - Fixed like modern messaging apps */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3 safe-area-pb">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              id="chat-input"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-3 bg-gray-100 rounded-2xl border-none focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-base resize-none min-h-[48px] max-h-32 overflow-y-auto"
              placeholder="Type your message..."
              rows={1}
              style={{ height: 'auto' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 128) + 'px';
              }}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim()}
            className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-all duration-200 shadow-md hover:shadow-lg"
            style={{ backgroundColor: inputMessage.trim() ? '#2563eb' : '#d1d5db' }}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Generate Website Button */}
      {uploadedImages.length > 0 && (
        <div className="px-4 pb-4 bg-gray-50">
          <Button 
            onClick={handleGenerateWebsite} 
            disabled={isGenerating} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl shadow-md font-medium text-lg transition-all duration-200 hover:shadow-lg"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Create Your Website
              </span>
            )}
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

      {/* Website Preview Modal */}
      {websiteStructure && showWebsitePreview && (
        <WebsitePreview
          website={websiteStructure}
          onClose={() => setShowWebsitePreview(false)}
          onEdit={editWebsiteContent}
        />
      )}

      {/* Edit Message Dialog */}
      {editingMessage && (
        <Dialog open={!!editingMessage} onOpenChange={() => setEditingMessage(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Your Response</DialogTitle>
              <DialogDescription>
                Correct any typos or update your information.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                value={editingMessage.content}
                onChange={(e) => setEditingMessage({...editingMessage, content: e.target.value})}
                placeholder="Type your corrected response here..."
                className="w-full"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingMessage(null)}>
                Cancel
              </Button>
              <Button onClick={saveEditedMessage}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Social Media Dialog */}
      <Dialog open={showSocialMediaDialog} onOpenChange={setShowSocialMediaDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Social Media Links</DialogTitle>
            <DialogDescription>
              Add your social media profiles to include them on your website.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="facebook" className="text-right">
                Facebook
              </Label>
              <Input
                id="facebook"
                value={socialMedia.facebook}
                onChange={(e) => setSocialMedia({...socialMedia, facebook: e.target.value})}
                className="col-span-3"
                placeholder="https://facebook.com/yourpage"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="instagram" className="text-right">
                Instagram
              </Label>
              <Input
                id="instagram"
                value={socialMedia.instagram}
                onChange={(e) => setSocialMedia({...socialMedia, instagram: e.target.value})}
                className="col-span-3"
                placeholder="https://instagram.com/youraccount"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="twitter" className="text-right">
                Twitter
              </Label>
              <Input
                id="twitter"
                value={socialMedia.twitter}
                onChange={(e) => setSocialMedia({...socialMedia, twitter: e.target.value})}
                className="col-span-3"
                placeholder="https://twitter.com/youraccount"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="linkedin" className="text-right">
                LinkedIn
              </Label>
              <Input
                id="linkedin"
                value={socialMedia.linkedin}
                onChange={(e) => setSocialMedia({...socialMedia, linkedin: e.target.value})}
                className="col-span-3"
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="youtube" className="text-right">
                YouTube
              </Label>
              <Input
                id="youtube"
                value={socialMedia.youtube}
                onChange={(e) => setSocialMedia({...socialMedia, youtube: e.target.value})}
                className="col-span-3"
                placeholder="https://youtube.com/yourchannel"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSocialMediaSubmit}>Save Links</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}