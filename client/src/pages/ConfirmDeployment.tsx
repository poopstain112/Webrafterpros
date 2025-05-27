import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CheckCircle, Globe, ArrowLeft, Rocket } from 'lucide-react';
import { trackCustomDomainInterest } from '@/lib/analytics';

export function ConfirmDeployment() {
  const [selectedVariant, setSelectedVariant] = useState('');
  const [selectedVariantName, setSelectedVariantName] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [deploying, setDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [deploymentUrl, setDeploymentUrl] = useState('');
  const [businessInfo, setBusinessInfo] = useState({
    name: '',
    type: '',
    location: ''
  });

  useEffect(() => {
    const variant = localStorage.getItem('selectedVariant');
    const variantName = localStorage.getItem('selectedVariantName');
    
    if (!variant || !variantName) {
      window.location.href = '/variant-preview';
      return;
    }
    
    setSelectedVariant(variant);
    setSelectedVariantName(variantName);
    
    // Extract business info from conversation data
    const conversationData = localStorage.getItem('conversationData') || '';
    const parts = conversationData.split(' | ');
    
    // Parse business details from the conversation
    const businessType = parts[0] || 'business';
    const businessName = parts[1] || 'Your Business';
    const location = parts.find(part => part.toLowerCase().includes('beach') || part.toLowerCase().includes('city')) || 'your area';
    
    setBusinessInfo({
      name: businessName,
      type: businessType,
      location: location
    });
    
    // Set suggested domain based on business name
    const suggestedDomain = businessName.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 15) + '.com';
    setCustomDomain(suggestedDomain);
    
  }, []);

  const handleGoBack = () => {
    window.location.href = '/variant-preview';
  };

  const handleDeploy = async () => {
    setDeploying(true);
    
    try {
      const selectedVariantHtml = localStorage.getItem('selectedVariantHtml');
      
      const response = await fetch('/api/deploy-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variant: selectedVariant,
          variantName: selectedVariantName,
          html: selectedVariantHtml,
          customDomain: customDomain.trim() || null
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        // Track successful deployment completion - Critical conversion metric!
        if (customDomain.trim()) {
          trackCustomDomainInterest(customDomain.trim());
        }
        
        setDeploymentUrl(data.url);
        setDeployed(true);
        // Clean up localStorage
        localStorage.removeItem('selectedVariant');
        localStorage.removeItem('selectedVariantName');
        localStorage.removeItem('selectedVariantHtml');
      } else {
        throw new Error(data.message || 'Deployment failed');
      }
    } catch (error) {
      console.error('Deployment error:', error);
      alert('Deployment failed. Please try again.');
    } finally {
      setDeploying(false);
    }
  };

  if (deployed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">Website Deployed Successfully!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-gray-600">
              Your {selectedVariantName} website is now live and ready for customers!
            </p>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-2">Your website is live at:</p>
              <a 
                href={deploymentUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-medium break-all"
              >
                {deploymentUrl}
              </a>
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => window.open(deploymentUrl, '_blank')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Globe className="w-4 h-4 mr-2" />
                View Live Website
              </Button>
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
              >
                Create Another Website
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Rocket className="w-6 h-6" />
            Deploy Your Website
          </CardTitle>
          <p className="text-gray-600">
            Confirm your website selection and deploy it live
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selected Design */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">Selected Design</h3>
            <p className="text-blue-700">{selectedVariantName}</p>
            <p className="text-sm text-blue-600 mt-1">
              Professional website with premium features and your {businessInfo.type} images
            </p>
          </div>

          {/* Custom Domain */}
          <div className="space-y-2">
            <Label htmlFor="domain">Custom Domain (Optional)</Label>
            <Input
              id="domain"
              type="text"
              placeholder={businessInfo.name ? `${businessInfo.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com` : "yourbusiness.com"}
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              className="w-full"
            />
            <p className="text-sm text-gray-500">
              Leave empty to use a free subdomain, or enter your custom domain
            </p>
            
            {customDomain && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-semibold text-amber-800 mb-2">📋 Custom Domain Setup</h4>
                <div className="text-sm text-amber-700 space-y-2">
                  <p><strong>Step 1:</strong> Purchase your domain from any registrar (GoDaddy, Namecheap, etc.)</p>
                  <p><strong>Step 2:</strong> In your domain's DNS settings, add these records:</p>
                  <div className="bg-white p-3 rounded border font-mono text-xs">
                    <div>Type: CNAME</div>
                    <div>Name: www</div>
                    <div>Value: your-site.ourplatform.com</div>
                  </div>
                  <div className="bg-white p-3 rounded border font-mono text-xs">
                    <div>Type: A</div>
                    <div>Name: @</div>
                    <div>Value: [IP will be provided after deployment]</div>
                  </div>
                  <p><strong>Step 3:</strong> Wait 24-48 hours for DNS to propagate</p>
                  <p className="text-amber-600">💡 <strong>Tip:</strong> We'll email you the exact settings after deployment!</p>
                </div>
              </div>
            )}
          </div>

          {/* Deployment Features */}
          <div className="space-y-3">
            <h3 className="font-semibold">Your website will include:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Professional design</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Mobile responsive</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Contact forms</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Image galleries</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Review system</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Fast loading</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleGoBack}
              variant="outline"
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button
              onClick={handleDeploy}
              disabled={deploying}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {deploying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Deploying...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4 mr-2" />
                  Deploy Website
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}