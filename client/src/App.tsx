import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Navigation, MobileNav } from "@/components/Navigation";

import Dashboard from "@/pages/Dashboard";
import StructureManager from "@/pages/StructureManager";
import PersonsManager from "@/pages/PersonsManager";
import ManageCards from "@/pages/ManageCards";
import CardDesigner from "@/pages/CardDesigner";
import BatchImport from "@/pages/BatchImport";
import PrintStation from "@/pages/PrintStation";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Navigation />
      <main className="md:pl-64 pb-20 md:pb-0 min-h-screen">
        <div className="p-4 md:p-8">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/structure" component={StructureManager} />
            <Route path="/persons" component={PersonsManager} />
            <Route path="/cards" component={ManageCards} />
            <Route path="/design" component={CardDesigner} />
            <Route path="/batch" component={BatchImport} />
            <Route path="/print" component={PrintStation} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Router />
    </QueryClientProvider>
  );
}

export default App;
