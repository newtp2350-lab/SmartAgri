import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TestTube, 
  Droplets, 
  Leaf, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  MapPin,
  Download
} from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";

const soilHealthData = [
  { nutrient: "Nitrogen", value: 65, optimal: 80 },
  { nutrient: "Phosphorus", value: 45, optimal: 60 },
  { nutrient: "Potassium", value: 75, optimal: 70 },
  { nutrient: "pH Level", value: 68, optimal: 70 },
  { nutrient: "Organic Matter", value: 55, optimal: 65 },
  { nutrient: "Moisture", value: 72, optimal: 75 },
];

const chartConfig = {
  value: {
    label: "Current Level",
    color: "hsl(var(--chart-1))",
  },
  optimal: {
    label: "Optimal Level", 
    color: "hsl(var(--chart-2))",
  },
};

const SoilInsights = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Soil Insights</h1>
          <p className="text-muted-foreground">
            Detailed soil analysis and health recommendations for your farm
          </p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Analysis
        </Button>
      </div>

      {/* Soil Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Overall Soil Health Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">7.2/10</div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">Good</Badge>
            </div>
            <div className="flex-1">
              <Progress value={72} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2">
                Your soil health is good with room for improvement in organic matter and nitrogen levels.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Soil Properties */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">pH Level</p>
                <p className="text-2xl font-bold">6.8</p>
                <p className="text-xs text-green-600">Slightly Acidic</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <TestTube className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Organic Carbon</p>
                <p className="text-2xl font-bold">1.8%</p>
                <p className="text-xs text-yellow-600">Moderate</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Leaf className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Moisture</p>
                <p className="text-2xl font-bold">22%</p>
                <p className="text-xs text-blue-600">Optimal</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Droplets className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Texture</p>
                <p className="text-2xl font-bold">Loam</p>
                <p className="text-xs text-green-600">Excellent</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analysis">Nutrient Analysis</TabsTrigger>
          <TabsTrigger value="recommendations">Fertilizer Tips</TabsTrigger>
          <TabsTrigger value="crops">Crop Suitability</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Nutrient Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={soilHealthData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="nutrient" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar name="Current" dataKey="value" stroke="var(--color-value)" fill="var(--color-value)" fillOpacity={0.3} />
                      <Radar name="Optimal" dataKey="optimal" stroke="var(--color-optimal)" fill="var(--color-optimal)" fillOpacity={0.1} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detailed Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {soilHealthData.map((item) => (
                  <div key={item.nutrient} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{item.nutrient}</span>
                      <span>{item.value}%</span>
                    </div>
                    <Progress value={item.value} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Recommended Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">Increase Nitrogen</h4>
                  <p className="text-sm text-green-700">
                    Apply urea fertilizer at 120 kg/hectare before next planting season.
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Organic Matter Boost</h4>
                  <p className="text-sm text-blue-700">
                    Add compost or well-rotted manure to improve soil structure and water retention.
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 mb-2">pH Adjustment</h4>
                  <p className="text-sm text-yellow-700">
                    Consider lime application to slightly increase pH for optimal nutrient availability.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  Cautions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-800 mb-2">Avoid Over-fertilization</h4>
                  <p className="text-sm text-orange-700">
                    Potassium levels are already good. Avoid excess potash fertilizers.
                  </p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-2">Drainage Check</h4>
                  <p className="text-sm text-red-700">
                    Monitor for waterlogging during monsoon season to prevent root rot.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="crops" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-700">Highly Suitable</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Wheat</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">95% Match</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Barley</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">92% Match</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Mustard</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">88% Match</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-yellow-700">Moderately Suitable</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Corn</span>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">75% Match</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Sorghum</span>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">72% Match</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Sunflower</span>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">68% Match</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-700">Not Recommended</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Rice</span>
                  <Badge variant="destructive">45% Match</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cotton</span>
                  <Badge variant="destructive">42% Match</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Sugarcane</span>
                  <Badge variant="destructive">38% Match</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Soil Health Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Track changes in your soil properties over time to monitor improvement from fertilization and farming practices.
              </p>
              <div className="text-center py-8 text-muted-foreground">
                <p>Historical data will appear here as you continue using SmartAgri Advisor.</p>
                <p className="text-sm mt-2">Start recording soil tests to build your trend analysis.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SoilInsights;