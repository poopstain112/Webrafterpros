import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useSwipeable } from 'react-swipeable';
import { Button } from '@/components/ui/button';
import { trackVariantSelection } from '@/lib/analytics';

interface WebsiteVariantViewerProps {
  websiteId: number;
  businessData: string;
}

const VARIANT_NAMES = [
  "Bold & Dramatic",
  "Premium Luxury", 
  "Vibrant Energy"
];

export function WebsiteVariantViewer({ websiteId, businessData }: WebsiteVariantViewerProps) {
  const [currentVariant, setCurrentVariant] = useState(1);
  const [variants, setVariants] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(false);

  const handleChooseDesign = (variantNumber: number) => {
    // Track variant selection - Key business intelligence!
    trackVariantSelection(VARIANT_NAMES[variantNumber - 1], variantNumber);
    
    // Store the selected variant and redirect to confirmation
    localStorage.setItem('selectedVariant', variantNumber.toString());
    localStorage.setItem('selectedVariantName', VARIANT_NAMES[variantNumber - 1]);
    localStorage.setItem('selectedVariantHtml', variants[variantNumber] || '');
    window.location.href = '/confirm-deployment';
  };

  const generateVariant = async (variantNumber: number) => {
    if (variants[variantNumber]) return; // Already generated
    
    setLoading(true);
    try {
      const response = await fetch('/api/generate-variant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId,
          description: businessData,
          variant: variantNumber
        })
      });
      
      const data = await response.json();
      setVariants(prev => ({
        ...prev,
        [variantNumber]: data.html
      }));
    } catch (error) {
      console.error('Failed to generate variant:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate first variant on load
  useEffect(() => {
    generateVariant(1);
  }, []);

  const switchVariant = (newVariant: number) => {
    setCurrentVariant(newVariant);
    generateVariant(newVariant);
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      const next = currentVariant < 3 ? currentVariant + 1 : 1;
      switchVariant(next);
    },
    onSwipedRight: () => {
      const prev = currentVariant > 1 ? currentVariant - 1 : 3;
      switchVariant(prev);
    },
    trackMouse: true
  });

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-100" {...swipeHandlers}>
      {/* Navigation Header */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => switchVariant(currentVariant > 1 ? currentVariant - 1 : 3)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="text-center">
              <div className="font-semibold text-sm">
                {VARIANT_NAMES[currentVariant - 1]}
              </div>
              <div className="text-xs text-gray-500">
                {currentVariant} of 3 • Swipe to navigate
              </div>
            </div>
            
            <button
              onClick={() => switchVariant(currentVariant < 3 ? currentVariant + 1 : 1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Choose This Design Button */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex flex-col items-center space-y-3">
          <Button
            onClick={() => handleChooseDesign(currentVariant)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            <Check className="w-5 h-5 mr-2" />
            Choose This Design
          </Button>
          
          {/* Variant Dots */}
          <div className="flex space-x-2">
            {[1, 2, 3].map((variant) => (
              <button
                key={variant}
                onClick={() => switchVariant(variant)}
                className={`w-3 h-3 rounded-full transition-all ${
                  currentVariant === variant
                    ? 'bg-white scale-125'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Website Content */}
      <div className="w-full h-full">
        {loading && !variants[currentVariant] ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <div className="text-lg font-semibold">Generating {VARIANT_NAMES[currentVariant - 1]}</div>
              <div className="text-sm text-gray-600">Creating your unique design...</div>
            </div>
          </div>
        ) : variants[currentVariant] ? (
          <iframe
            srcDoc={variants[currentVariant]}
            className="w-full h-full border-0"
            title={`Website Variant ${currentVariant}`}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-lg font-semibold mb-2">Ready to generate</div>
              <div className="text-sm text-gray-600">{VARIANT_NAMES[currentVariant - 1]} design</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}