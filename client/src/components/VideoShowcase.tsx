import { useState } from 'react';
import { Play, X, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoShowcaseProps {
  thumbnailUrl?: string;
  videoUrl?: string;
  title?: string;
  description?: string;
}

export function VideoShowcase({ 
  thumbnailUrl = "/api/placeholder/800/450", 
  videoUrl = "",
  title = "Create Professional Websites in Minutes",
  description = "Watch how easy it is to generate stunning business websites with AI"
}: VideoShowcaseProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSkipPrompt, setShowSkipPrompt] = useState(false);

  const handlePlay = () => {
    setIsPlaying(true);
    // Show skip option after 3 seconds
    setTimeout(() => setShowSkipPrompt(true), 3000);
  };

  const handleSkip = () => {
    setIsPlaying(false);
    setShowSkipPrompt(false);
    // Scroll to the main app or trigger start action
    document.getElementById('main-app')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleClose = () => {
    setIsPlaying(false);
    setShowSkipPrompt(false);
  };

  if (isPlaying) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
        <div className="relative w-full max-w-4xl mx-4">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            aria-label="Close video"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Video Container */}
          <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl">
            {videoUrl ? (
              <video
                className="w-full aspect-video"
                controls
                autoPlay
                onEnded={handleSkip}
              >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              // Placeholder for when video URL is provided
              <div className="w-full aspect-video bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <h3 className="text-2xl font-bold mb-4">Demo Video Coming Soon!</h3>
                  <p className="text-lg mb-6">Watch how fast you can create professional websites</p>
                  <Button onClick={handleSkip} className="bg-white text-blue-600 hover:bg-gray-100">
                    Start Creating Now
                  </Button>
                </div>
              </div>
            )}

            {/* Skip Button Overlay */}
            {showSkipPrompt && (
              <div className="absolute top-4 right-4">
                <Button
                  onClick={handleSkip}
                  variant="secondary"
                  size="sm"
                  className="bg-black bg-opacity-70 text-white hover:bg-opacity-90 transition-all"
                >
                  <SkipForward className="w-4 h-4 mr-2" />
                  Skip to App
                </Button>
              </div>
            )}
          </div>

          {/* Video Info */}
          <div className="text-center mt-6 text-white">
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-300">{description}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group cursor-pointer" onClick={handlePlay}>
      {/* Thumbnail */}
      <div className="relative overflow-hidden rounded-xl shadow-lg">
        <img
          src={thumbnailUrl}
          alt="Video thumbnail"
          className="w-full aspect-video object-cover transition-transform group-hover:scale-105"
        />
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center group-hover:bg-opacity-20 transition-all">
          <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
            <Play className="w-6 h-6 text-gray-800 ml-1" />
          </div>
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
          1:30
        </div>
      </div>

      {/* Video Info */}
      <div className="mt-4 text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>
  );
}