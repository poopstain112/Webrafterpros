import React, { useEffect, useState } from 'react';
import { useWebsiteGeneration } from '../contexts/WebsiteGenerationContext';
import { useToast } from '@/hooks/use-toast';

const WebsiteLoadingScreen: React.FC = () => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { description, businessType, cancelGeneration, finishGeneration } = useWebsiteGeneration();
  const { toast } = useToast();
  
  const steps = [
    "Analyzing your business information...",
    "Creating responsive layout structure...",
    "Optimizing colors and typography for your brand...",
    "Generating professional content...",
    "Adding images and enhancing visual elements...",
    "Finalizing your custom website..."
  ];
  
  // Handle website generation process
  useEffect(() => {
    let progressInterval: NodeJS.Timeout | undefined;
    let stepUpdateInterval: NodeJS.Timeout | undefined;
    
    const generateWebsite = async () => {
      try {
        // Reset any previous errors and clear any previous website data
        setError(null);
        
        // Clear any previous website data from localStorage
        localStorage.removeItem('generatedWebsiteHTML');
        localStorage.removeItem('websiteGeneratedAt');
        
        // Start the progress animation
        progressInterval = setInterval(() => {
          setLoadingProgress(prev => {
            if (prev >= 95) {
              if (progressInterval) clearInterval(progressInterval);
              return 95;
            }
            return prev + 1;
          });
        }, 100);
        
        // Update current step based on progress
        stepUpdateInterval = setInterval(() => {
          setCurrentStep(prev => {
            const newStep = Math.floor((loadingProgress / 100) * steps.length);
            return newStep;
          });
          
          if (loadingProgress >= 95) {
            clearInterval(stepUpdateInterval);
          }
        }, 500);
        
        console.log("Starting website generation from dedicated page");
        
        // Fetch uploaded images for the current website
        const imagesResponse = await fetch('/api/websites/1/images');
        if (!imagesResponse.ok) {
          throw new Error('Failed to retrieve uploaded images');
        }
        
        const websiteImages = await imagesResponse.json();
        
        // Extract image URLs for generation
        const imageUrls = websiteImages.map((img: any) => img.url);
        console.log("Including images in website generation:", imageUrls);
        
        // Fetch all messages to create a comprehensive description
        const messagesResponse = await fetch('/api/websites/1/messages');
        if (!messagesResponse.ok) {
          throw new Error('Failed to retrieve message history');
        }
        
        const messages = await messagesResponse.json();
        
        // Create a thorough description from all user messages
        const fullDescription = messages
          .filter((msg: any) => msg.role === 'user')
          .map((msg: any) => msg.content)
          .join(" | ");
          
        console.log("Creating description from user messages:", fullDescription);
        
        // Make API call to generate website with images and full description
        const response = await fetch('/api/generate-website', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description: fullDescription || description || "Professional business website",
            imageUrls,
            businessType: businessType || 'unspecified',
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to generate website');
        }
        
        // Website generated successfully
        const websiteData = await response.json();
        
        // Set progress to 100%
        if (progressInterval) clearInterval(progressInterval);
        if (stepUpdateInterval) clearInterval(stepUpdateInterval);
        setLoadingProgress(100);
        setCurrentStep(steps.length - 1);
        
        // Store the website data in localStorage so it can be accessed in the chat view
        if (websiteData && websiteData.html) {
          // Wrap HTML in proper document structure with essential styling
          const enhancedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${businessType || 'Business'} Website</title>
  <style>
    /* Essential styling */
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    img { max-width: 100%; height: auto; }
    * { box-sizing: border-box; }
  </style>
</head>
<body>
  ${websiteData.html}
</body>
</html>`;
          
          localStorage.setItem('generatedWebsiteHTML', enhancedHtml);
          localStorage.setItem('websiteGeneratedAt', new Date().toISOString());
          console.log("Enhanced HTML stored in localStorage:", enhancedHtml.length, "characters");
          
          // Give a bit of time for the user to see the 100% completion
          setTimeout(() => {
            // Force immediate navigation to preview screen
            toast({
              title: 'Success!',
              description: 'Your website has been generated successfully.',
            });
            
            // Direct navigation to website preview screen
            console.log("REDIRECTING to website preview page");
            window.location.href = '/website-preview';
          }, 800);
        } else {
          throw new Error('No HTML content received from the server');
        }
      } catch (error: any) {
        console.error('Error generating website:', error);
        
        // Clear the intervals if they're still running
        if (progressInterval) clearInterval(progressInterval);
        if (stepUpdateInterval) clearInterval(stepUpdateInterval);
        
        // More detailed error handling
        let errorMessage = 'Failed to generate website. Please try again.';
        
        // Check if error is an Error object with a message
        if (error instanceof Error) {
          errorMessage = `Website generation failed: ${error.message}`;
        }
        
        // Show toast with error message
        toast({
          title: 'Generation Failed',
          description: errorMessage,
          variant: 'destructive',
        });
        
        // As a fallback, also call finishGeneration() after a short delay
        setTimeout(() => {
          if (window.location.pathname !== '/website-preview') {
            finishGeneration();
          }
        }, 500);
        
        // Add a slight delay before canceling to ensure the user sees the toast
        setTimeout(() => {
          cancelGeneration();
        }, 1500);
      }
    };
    
    // Start the API call
    generateWebsite();
    
    // Cleanup
    return () => {
      if (progressInterval) clearInterval(progressInterval);
      if (stepUpdateInterval) clearInterval(stepUpdateInterval);
    };
  }, [description, businessType, finishGeneration, cancelGeneration, toast, steps.length]);

  // UI for the loading screen
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-lg">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-center">Generating Your Website</h1>
          
          <div className="space-y-2">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-in-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{steps[currentStep]}</span>
              <span className="text-sm font-medium">{loadingProgress}%</span>
            </div>
          </div>
          
          <div className="text-center text-muted-foreground text-sm">
            <p>This may take a minute or two. We're creating a professional website just for you.</p>
          </div>
          
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WebsiteLoadingScreen;