import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useLocation } from 'wouter';

// Define the types
interface WebsiteGenerationContextType {
  isGenerating: boolean;
  description: string;
  businessType: string;
  startGeneration: (description: string, businessType: string) => void;
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
  const [, setLocation] = useLocation();

  const startGeneration = (description: string, businessType: string) => {
    setDescription(description);
    setBusinessType(businessType);
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