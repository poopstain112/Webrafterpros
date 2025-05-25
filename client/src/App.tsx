import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import SimpleChat from "@/pages/SimpleChat";
import GeneratingVariants from "@/pages/GeneratingVariants";
import { VariantPreview } from "@/pages/VariantPreview";
import { WebsiteGenerationProvider } from "./contexts/WebsiteGenerationContext";
import { Route, Switch } from "wouter";
import "./App.css";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <WebsiteGenerationProvider>
          <div className="w-full h-screen">
            <Switch>
              <Route path="/" component={SimpleChat} />
              <Route path="/generating-variants" component={GeneratingVariants} />
              <Route path="/variant-preview" component={VariantPreview} />
              <Route component={SimpleChat} />
            </Switch>
          </div>
        </WebsiteGenerationProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
