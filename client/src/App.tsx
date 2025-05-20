import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, Link } from "wouter";
import SimplifiedHome from "@/pages/SimplifiedHome";
import TestUpload from "@/pages/TestUpload";
import SimpleTest from "@/pages/SimpleTest";
import "./App.css";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <div className="app-container">
          <div className="bg-gray-100 p-2 flex gap-4 text-sm">
            <Link href="/">
              <a className="text-blue-600 hover:underline">Home</a>
            </Link>
            <Link href="/simple-test">
              <a className="text-blue-600 hover:underline">Simple Upload Test</a>
            </Link>
          </div>
          <Switch>
            <Route path="/" component={SimplifiedHome} />
            <Route path="/test-upload" component={TestUpload} />
            <Route path="/simple-test" component={SimpleTest} />
          </Switch>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
