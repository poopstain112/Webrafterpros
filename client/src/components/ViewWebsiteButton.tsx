import { useLocation } from 'wouter';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ViewWebsiteButtonProps {
  className?: string;
}

export default function ViewWebsiteButton({ className = '' }: ViewWebsiteButtonProps) {
  const [, navigate] = useLocation();
  
  // Check if website HTML exists in localStorage
  const websiteExists = localStorage.getItem('generatedWebsiteHTML') !== null;
  
  if (!websiteExists) {
    return null;
  }
  
  const goToWebsitePreview = () => {
    navigate('/website-preview');
  };
  
  return (
    <Button
      onClick={goToWebsitePreview}
      className={`bg-white text-blue-600 hover:bg-blue-50 flex items-center gap-1 ${className}`}
      size="sm"
    >
      <ExternalLink size={14} />
      View Website
    </Button>
  );
}