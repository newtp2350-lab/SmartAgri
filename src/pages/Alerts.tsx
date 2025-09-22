import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import AlertsComponent from "@/components/AlertsComponent";
import { useLocation } from "@/hooks/use-location";
import { useRef } from "react";

const Alerts = () => {
  const { location } = useLocation();
  const alertsComponentRef = useRef<{ refreshAlerts: () => void }>(null);


  const handleRefresh = () => {
    if (alertsComponentRef.current) {
      alertsComponentRef.current.refreshAlerts();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Alerts & Notifications</h1>
          <p className="text-muted-foreground">
            Stay informed about weather, pests, market changes, and farm operations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Database-integrated Alerts Component */}
      <AlertsComponent ref={alertsComponentRef} location={location} />
    </div>
  );
};

export default Alerts;