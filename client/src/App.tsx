import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import SimpleChat from "@/pages/SimpleChat";
import ChatPage from "@/pages/ChatPage";
import FixedUpload from "@/pages/FixedUpload";
import WebsiteLoadingScreen from "@/pages/WebsiteLoadingScreen";
import WebsitePreviewScreen from "@/pages/WebsitePreviewScreen";

import SwipeableLayout from "@/components/SwipeableLayout";
import { WebsiteGenerationProvider } from "./contexts/WebsiteGenerationContext";
import "./App.css";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <WebsiteGenerationProvider>
          <SwipeableLayout>
            <Switch>
              <Route path="/" component={SimpleChat} />
              {/* Removed /upload route to skip that screen entirely */}
              <Route path="/generating-website" component={WebsiteLoadingScreen} />
              <Route path="/website-preview" component={WebsitePreviewScreen} />

            </Switch>
          </SwipeableLayout>
        </WebsiteGenerationProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
