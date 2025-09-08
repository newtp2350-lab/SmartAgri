import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  Thermometer, 
  Droplets, 
  Wind, 
  Eye,
  AlertTriangle,
  TrendingUp,
  Download
} from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";

const weatherData = [
  { day: "Mon", temp: 28, humidity: 65, rainfall: 0 },
  { day: "Tue", temp: 30, humidity: 58, rainfall: 2 },
  { day: "Wed", temp: 27, humidity: 72, rainfall: 15 },
  { day: "Thu", temp: 25, humidity: 80, rainfall: 25 },
  { day: "Fri", temp: 29, humidity: 60, rainfall: 0 },
  { day: "Sat", temp: 31, humidity: 55, rainfall: 0 },
  { day: "Sun", temp: 32, humidity: 52, rainfall: 0 },
];

const historicalData = [
  { month: "Jan", rainfall: 45, temp: 24 },
  { month: "Feb", rainfall: 38, temp: 26 },
  { month: "Mar", rainfall: 52, temp: 29 },
  { month: "Apr", rainfall: 78, temp: 31 },
  { month: "May", rainfall: 95, temp: 33 },
  { month: "Jun", rainfall: 125, temp: 35 },
];

const chartConfig = {
  temp: {
    label: "Temperature (°C)",
    color: "hsl(var(--chart-1))",
  },
  humidity: {
    label: "Humidity (%)",
    color: "hsl(var(--chart-2))",
  },
  rainfall: {
    label: "Rainfall (mm)",
    color: "hsl(var(--chart-3))",
  },
};

const Weather = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Weather Analytics</h1>
          <p className="text-muted-foreground">
            Historical, current, and forecasted weather patterns for your farm
          </p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Current Weather */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Temperature</p>
                <p className="text-2xl font-bold">29°C</p>
              </div>
              <Thermometer className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Humidity</p>
                <p className="text-2xl font-bold">68%</p>
              </div>
              <Droplets className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Wind Speed</p>
                <p className="text-2xl font-bold">12 km/h</p>
              </div>
              <Wind className="w-8 h-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Visibility</p>
                <p className="text-2xl font-bold">10 km</p>
              </div>
              <Eye className="w-8 h-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Heavy rainfall expected in 2 days. Consider delaying planting.
          </AlertDescription>
        </Alert>
        
        <Alert className="border-green-200 bg-green-50">
          <Sun className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Optimal conditions for wheat growth this week.
          </AlertDescription>
        </Alert>
        
        <Alert className="border-blue-200 bg-blue-50">
          <CloudRain className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Good irrigation window for next 3 days.
          </AlertDescription>
        </Alert>
      </div>

      <Tabs defaultValue="forecast" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="forecast">7-Day Forecast</TabsTrigger>
          <TabsTrigger value="historical">Historical Trends</TabsTrigger>
          <TabsTrigger value="crop-impact">Crop Impact</TabsTrigger>
        </TabsList>

        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Temperature & Humidity Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weatherData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="temp" stroke="var(--color-temp)" strokeWidth={2} />
                    <Line type="monotone" dataKey="humidity" stroke="var(--color-humidity)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rainfall Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={weatherData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="rainfall" fill="var(--color-rainfall)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historical Weather Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="rainfall" stroke="var(--color-rainfall)" strokeWidth={2} />
                    <Line type="monotone" dataKey="temp" stroke="var(--color-temp)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crop-impact" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Favorable Conditions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Wheat</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">Excellent</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Barley</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">Good</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Mustard</span>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Fair</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Risk Conditions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Tomatoes</span>
                  <Badge variant="destructive">High Risk</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cotton</span>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">Moderate Risk</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Rice</span>
                  <Badge variant="secondary" className="bg-red-100 text-red-800">Delay Planting</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Weather;