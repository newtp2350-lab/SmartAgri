import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import FarmHistoryComponent from "@/components/FarmHistory";
import { useLocation } from "@/hooks/use-location";

const FarmHistory = () => {
  const { location } = useLocation();


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Farm History & Analytics</h1>
          <p className="text-muted-foreground">
            Track your farming activities, yields, and performance over time
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Database-integrated Farm History Component */}
      <FarmHistoryComponent location={location} />
    </div>
  );
};

export default FarmHistory;