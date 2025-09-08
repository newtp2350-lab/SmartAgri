import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Bell, 
  Cloud, 
  Bug, 
  TrendingUp, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  Info,
  X
} from "lucide-react";

const activeAlerts = [
  {
    id: 1,
    type: "weather",
    priority: "high",
    title: "Heavy Rainfall Warning",
    message: "25-30mm rainfall expected in next 48 hours. Consider postponing field operations.",
    time: "2 hours ago",
    icon: Cloud,
    actions: ["View Weather Details", "Dismiss"]
  },
  {
    id: 2,
    type: "pest",
    priority: "medium",
    title: "Pest Risk Alert",
    message: "Conditions favorable for aphid development. Monitor wheat crops closely.",
    time: "5 hours ago",
    icon: Bug,
    actions: ["View Pest Guide", "Mark as Handled"]
  },
  {
    id: 3,
    type: "market",
    priority: "low",
    title: "Price Increase",
    message: "Wheat prices increased by 5.2% in local markets. Good time to sell.",
    time: "1 day ago",
    icon: TrendingUp,
    actions: ["View Market Data", "Dismiss"]
  }
];

const alertHistory = [
  {
    id: 4,
    type: "weather",
    title: "Frost Warning Cleared",
    message: "Temperature risk has passed. Safe to resume normal operations.",
    time: "3 days ago",
    status: "resolved"
  },
  {
    id: 5,
    type: "market",
    title: "Cotton Price Alert",
    message: "Cotton prices reached your target of ₹5,800/quintal.",
    time: "1 week ago",
    status: "acted"
  },
  {
    id: 6,
    type: "pest",
    title: "Disease Prevention",
    message: "Applied recommended fungicide treatment for rust prevention.",
    time: "2 weeks ago",
    status: "completed"
  }
];

const alertSettings = [
  {
    category: "Weather Alerts",
    alerts: [
      { name: "Heavy Rainfall", enabled: true },
      { name: "Drought Conditions", enabled: true },
      { name: "Frost Warnings", enabled: true },
      { name: "Wind Speed", enabled: false },
    ]
  },
  {
    category: "Pest & Disease",
    alerts: [
      { name: "Pest Risk", enabled: true },
      { name: "Disease Outbreak", enabled: true },
      { name: "Beneficial Insects", enabled: false },
    ]
  },
  {
    category: "Market Alerts",
    alerts: [
      { name: "Price Targets", enabled: true },
      { name: "Market Trends", enabled: false },
      { name: "Volume Changes", enabled: false },
    ]
  },
  {
    category: "Farm Operations",
    alerts: [
      { name: "Planting Reminders", enabled: true },
      { name: "Harvest Time", enabled: true },
      { name: "Fertilizer Schedule", enabled: true },
    ]
  }
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high": return "border-red-200 bg-red-50";
    case "medium": return "border-yellow-200 bg-yellow-50";
    case "low": return "border-blue-200 bg-blue-50";
    default: return "border-gray-200 bg-gray-50";
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "high": return <Badge variant="destructive">High</Badge>;
    case "medium": return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium</Badge>;
    case "low": return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Low</Badge>;
    default: return <Badge variant="secondary">Normal</Badge>;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "resolved": return <CheckCircle className="w-4 h-4 text-green-500" />;
    case "acted": return <TrendingUp className="w-4 h-4 text-blue-500" />;
    case "completed": return <CheckCircle className="w-4 h-4 text-green-500" />;
    default: return <Info className="w-4 h-4 text-gray-500" />;
  }
};

const Alerts = () => {
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
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline">
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <Bell className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold text-red-600">1</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <Bell className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold">15</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active Alerts</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="settings">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="space-y-4">
            {activeAlerts.map((alert) => {
              const IconComponent = alert.icon;
              return (
                <Card key={alert.id} className={getPriorityColor(alert.priority)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{alert.title}</h3>
                            {getPriorityBadge(alert.priority)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {alert.message}
                          </p>
                          <p className="text-xs text-muted-foreground">{alert.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {alert.actions.map((action, index) => (
                          <Button key={index} variant="outline" size="sm">
                            {action}
                          </Button>
                        ))}
                        <Button variant="ghost" size="sm">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {activeAlerts.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
                <p className="text-muted-foreground">
                  No active alerts at the moment. Your farm operations are running smoothly.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="space-y-4">
            {alertHistory.map((alert) => (
              <Card key={alert.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(alert.status)}
                      <div>
                        <h3 className="font-semibold">{alert.title}</h3>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{alert.time}</p>
                      <Badge variant="outline" className="mt-1">
                        {alert.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {alertSettings.map((category) => (
                <div key={category.category}>
                  <h3 className="font-semibold mb-4">{category.category}</h3>
                  <div className="space-y-3">
                    {category.alerts.map((alert) => (
                      <div key={alert.name} className="flex items-center justify-between">
                        <span className="text-sm">{alert.name}</span>
                        <Switch checked={alert.enabled} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delivery Methods</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive alerts in your browser</p>
                </div>
                <Switch checked={true} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Get alerts via email</p>
                </div>
                <Switch checked={false} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">SMS Alerts</p>
                  <p className="text-sm text-muted-foreground">Critical alerts via text message</p>
                </div>
                <Switch checked={true} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Alerts;