import { useEffect, useState } from 'react';
import { VariantLoadingScreen } from '../components/VariantLoadingScreen';

export default function GeneratingVariants() {
  const handleComplete = () => {
    // Redirect to the 3-variant swipe viewer
    window.location.href = '/variant-preview';
  };

  return <VariantLoadingScreen onComplete={handleComplete} />;
}