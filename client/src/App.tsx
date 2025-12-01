import { Switch, Route, Router } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import HistoryPage from "@/pages/History";
import Strategies from "@/pages/Settings";

function Routes() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/history" component={HistoryPage} />
      <Route path="/strategies" component={Strategies} />
      <Route path="/settings" component={Strategies} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Routes />
        </TooltipProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;