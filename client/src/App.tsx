import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, Link } from "wouter";
import SimplifiedHome from "@/pages/SimplifiedHome";
import SimpleTest from "@/pages/SimpleTest";
import FixedUpload from "@/pages/FixedUpload";
import "./App.css";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <div className="app-container">
          <div className="bg-gray-50 p-2 flex space-x-4 text-sm border-b">
            <Link href="/">Home</Link>
            <Link href="/upload">Image Upload Test</Link>
          </div>
          <Switch>
            <Route path="/" component={SimplifiedHome} />
            <Route path="/simple-test" component={SimpleTest} />
            <Route path="/upload" component={FixedUpload} />
          </Switch>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
