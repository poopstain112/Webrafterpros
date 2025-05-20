import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import SimplifiedHome from "@/pages/SimplifiedHome";
import SimpleTest from "@/pages/SimpleTest";
import "./App.css";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <div className="app-container">
          <Switch>
            <Route path="/" component={SimplifiedHome} />
            <Route path="/simple-test" component={SimpleTest} />
          </Switch>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
