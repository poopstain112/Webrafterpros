import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import SimpleChat from "@/pages/SimpleChat";
import GeneratingVariants from "@/pages/GeneratingVariants";
import { VariantPreview } from "@/pages/VariantPreview";
import { ConfirmDeployment } from "@/pages/ConfirmDeployment";
import AnalyticsDashboard from "@/pages/AnalyticsDashboard";
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
              <Route path="/confirm-deployment" component={ConfirmDeployment} />
              <Route path="/admin/analytics" component={AnalyticsDashboard} />
              <Route component={SimpleChat} />
            </Switch>
          </div>
        </WebsiteGenerationProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
