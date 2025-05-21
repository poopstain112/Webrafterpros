import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useLocation } from 'wouter';

// Define the types
interface WebsiteGenerationContextType {
  isGenerating: boolean;
  description: string;
  businessType: string;
  websiteId?: number;
  startGeneration: (descriptionOrWebsiteId: string | number, businessType?: string) => void;
  cancelGeneration: () => void;
  finishGeneration: () => void;
}

// Create the context
const WebsiteGenerationContext = createContext<WebsiteGenerationContextType | undefined>(undefined);

// Provider component
export const WebsiteGenerationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [description, setDescription] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [websiteId, setWebsiteId] = useState<number | undefined>(undefined);
  const [, setLocation] = useLocation();

  const startGeneration = (descriptionOrWebsiteId: string | number, businessType?: string) => {
    if (typeof descriptionOrWebsiteId === 'number') {
      // If first parameter is a number, it's a websiteId
      setWebsiteId(descriptionOrWebsiteId);
      setDescription('');
      setBusinessType('');
    } else {
      // Otherwise it's a description string with business type
      setDescription(descriptionOrWebsiteId);
      setBusinessType(businessType || '');
      setWebsiteId(undefined);
    }
    
    setIsGenerating(true);
    // Navigate to the loading screen
    setLocation('/generating-website');
  };

  const cancelGeneration = () => {
    setIsGenerating(false);
    setDescription('');
    setBusinessType('');
    // Navigate back to the home page
    setLocation('/');
  };

  const finishGeneration = () => {
    setIsGenerating(false);
    // Navigate to the home page which will show the website
    setLocation('/');
  };

  return (
    <WebsiteGenerationContext.Provider
      value={{
        isGenerating,
        description,
        businessType,
        websiteId,
        startGeneration,
        cancelGeneration,
        finishGeneration,
      }}
    >
      {children}
    </WebsiteGenerationContext.Provider>
  );
};

// Hook for using the context
export const useWebsiteGeneration = () => {
  const context = useContext(WebsiteGenerationContext);
  if (context === undefined) {
    throw new Error('useWebsiteGeneration must be used within a WebsiteGenerationProvider');
  }
  return context;
};