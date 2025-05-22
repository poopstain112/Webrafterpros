import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function EditWebsiteScreen() {
  const [, setLocation] = useLocation();
  const [isGenerating, setIsGenerating] = useState(false);
  const [alternatives, setAlternatives] = useState<{ html: string; title: string }[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    generateAlternatives();
  }, []);

  const generateAlternatives = async () => {
    setIsGenerating(true);
    try {
      // Generate 2 alternative versions
      const [alt1Response, alt2Response] = await Promise.all([
        fetch('/api/generate-website', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            websiteId: 1,
            variation: 'modern'
          })
        }),
        fetch('/api/generate-website', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            websiteId: 1,
            variation: 'professional'
          })
        })
      ]);

      const alt1 = await alt1Response.json();
      const alt2 = await alt2Response.json();

      setAlternatives([
        { html: alt1.html, title: "Modern Style" },
        { html: alt2.html, title: "Professional Style" }
      ]);
    } catch (error) {
      console.error("Error generating alternatives:", error);
      toast({
        title: "Generation Error",
        description: "Failed to generate website alternatives. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const selectAlternative = (selectedHtml: string) => {
    // Save the selected version
    localStorage.setItem('generatedWebsiteHTML', selectedHtml);
    
    toast({
      title: "Website Updated!",
      description: "Your new website version has been saved.",
    });

    // Go back to preview
    setLocation('/website-preview');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation('/website-preview')}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Website</h1>
          <p className="text-gray-600">Choose your preferred style</p>
        </div>
      </div>

      {isGenerating ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Generating Alternatives
          </h2>
          <p className="text-gray-600 text-center">
            Creating 2 new website versions for you to choose from...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {alternatives.map((alt, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="p-4 border-b bg-white">
                <h3 className="font-semibold text-lg">{alt.title}</h3>
              </div>
              
              {/* Website Preview */}
              <div className="relative">
                <div 
                  className="h-96 overflow-hidden border-b"
                  style={{ transform: 'scale(0.3)', transformOrigin: 'top left', width: '333%', height: '1280px' }}
                >
                  <iframe
                    srcDoc={alt.html}
                    className="w-full h-full border-0"
                    title={`Website Preview ${index + 1}`}
                  />
                </div>
              </div>

              <div className="p-4 bg-white">
                <Button 
                  onClick={() => selectAlternative(alt.html)}
                  className="w-full"
                  size="lg"
                >
                  Choose This Style
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!isGenerating && alternatives.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-600 mb-4">Failed to generate alternatives</p>
          <Button onClick={generateAlternatives}>
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}