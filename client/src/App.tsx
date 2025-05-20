import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, Link, useLocation } from "wouter";
import SimpleChat from "@/pages/SimpleChat";
import FixedUpload from "@/pages/FixedUpload";
import WebsiteLoadingScreen from "@/pages/WebsiteLoadingScreen";
import AppNavigation from "@/components/AppNavigation";
import { WebsiteGenerationProvider } from "./contexts/WebsiteGenerationContext";
import { Home, MessageCircle, Image, Settings } from "lucide-react";
import "./App.css";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <WebsiteGenerationProvider>
          <div className="app-container pb-16"> {/* Added padding to bottom for navigation */}
            <Switch>
              <Route path="/" component={SimpleChat} />
              <Route path="/upload" component={FixedUpload} />
              <Route path="/generating-website" component={WebsiteLoadingScreen} />
            </Switch>
            
            {/* Navigation component */}
            <AppNavigation />
          </div>
        </WebsiteGenerationProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
