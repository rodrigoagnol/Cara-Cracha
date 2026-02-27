import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ChildRegistration from "./pages/ChildRegistration";
import GuardianRegistration from "./pages/GuardianRegistration";
import AdminPanel from "./pages/AdminPanel";
import Portaria from "./pages/Portaria";
import ExitHistory from "./pages/ExitHistory";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/child-registration" component={ChildRegistration} />
      <Route path="/guardian-registration" component={GuardianRegistration} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/portaria" component={Portaria} />
      <Route path="/history" component={ExitHistory} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
