import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import SimpleChat from "@/pages/SimpleChat";
import { WebsiteGenerationProvider } from "./contexts/WebsiteGenerationContext";
import "./App.css";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <WebsiteGenerationProvider>
          <div className="w-full h-screen">
            <SimpleChat />
          </div>
        </WebsiteGenerationProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
