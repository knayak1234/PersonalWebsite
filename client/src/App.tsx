import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { initAnimations } from "@/lib/animations";
import { useEffect } from "react";
import Homepage from "@/pages/homepage";
import AdminPage from "@/pages/admin";
import NotFound from "@/pages/not-found";
import Chatbot from "@/components/chatbot";
import LabHome from "@/pages/lab/LabHome";
import ComparisonDashboard from "@/pages/lab/ComparisonDashboard";
import ExperimentPage from "@/pages/lab/ExperimentPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Homepage} />
      <Route path="/admin" component={AdminPage} />
      {/* MSc Physics Computer Programming Laboratory.
          Order matters in wouter: the static /comparison route must precede
          the dynamic /:id route so it is matched first. */}
      <Route path="/teaching/computer-programming" component={LabHome} />
      <Route path="/teaching/computer-programming/comparison" component={ComparisonDashboard} />
      <Route path="/teaching/computer-programming/:id" component={ExperimentPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    initAnimations();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <Chatbot />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
