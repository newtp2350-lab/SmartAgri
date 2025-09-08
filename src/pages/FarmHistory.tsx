import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  TrendingUp, 
  BarChart3, 
  Leaf, 
  DollarSign,
  Plus,
  Download,
  Target,
  Award
} from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";

const yieldData = [
  { season: "2021 Kharif", wheat: 28, rice: 35, corn: 45, predicted: 30 },
  { season: "2021 Rabi", wheat: 32, rice: 38, corn: 48, predicted: 35 },
  { season: "2022 Kharif", wheat: 30, rice: 40, corn: 50, predicted: 32 },
  { season: "2022 Rabi", wheat: 35, rice: 42, corn: 52, predicted: 38 },
  { season: "2023 Kharif", wheat: 33, rice: 44, corn: 55, predicted: 36 },
  { season: "2023 Rabi", wheat: 38, rice: 46, corn: 58, predicted: 40 },
];

const profitData = [
  { year: "2021", revenue: 245000, cost: 180000, profit: 65000 },
  { year: "2022", revenue: 290000, cost: 195000, profit: 95000 },
  { year: "2023", revenue: 340000, cost: 210000, profit: 130000 },
];

const cropHistory = [
  { season: "2023 Rabi", crop: "Wheat", area: "5 hectares", yield: "38 quintals/ha", profit: "₹85,000" },
  { season: "2023 Kharif", crop: "Rice", area: "3 hectares", yield: "44 quintals/ha", profit: "₹65,000" },
  { season: "2022 Rabi", crop: "Barley", area: "4 hectares", yield: "35 quintals/ha", profit: "₹55,000" },
  { season: "2022 Kharif", crop: "Corn", area: "6 hectares", yield: "52 quintals/ha", profit: "₹95,000" },
];

const chartConfig = {
  wheat: {
    label: "Wheat (quintals/ha)",
    color: "hsl(var(--chart-1))",
  },
  rice: {
    label: "Rice (quintals/ha)",
    color: "hsl(var(--chart-2))",
  },
  corn: {
    label: "Corn (quintals/ha)",
    color: "hsl(var(--chart-3))",
  },
  predicted: {
    label: "AI Prediction",
    color: "hsl(var(--chart-4))",
  },
  revenue: {
    label: "Revenue (₹)",
    color: "hsl(var(--chart-1))",
  },
  cost: {
    label: "Cost (₹)",
    color: "hsl(var(--chart-2))",
  },
  profit: {
    label: "Profit (₹)",
    color: "hsl(var(--chart-3))",
  },
};

const FarmHistory = () => {
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
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Record
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Seasons</p>
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-green-600">Since 2021</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Yield Growth</p>
                <p className="text-2xl font-bold">+15%</p>
                <p className="text-xs text-green-600">Year over year</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Best Crop</p>
                <p className="text-2xl font-bold">Corn</p>
                <p className="text-xs text-green-600">58 quintals/ha</p>
              </div>
              <Award className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Profit</p>
                <p className="text-2xl font-bold">₹2.9L</p>
                <p className="text-xs text-green-600">Last 3 years</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="yields">Yield Analysis</TabsTrigger>
          <TabsTrigger value="profits">Profit/Loss</TabsTrigger>
          <TabsTrigger value="sustainability">Sustainability</TabsTrigger>
          <TabsTrigger value="rotation">Crop Rotation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Farming Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cropHistory.map((record, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Leaf className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{record.crop} - {record.season}</h3>
                        <p className="text-sm text-muted-foreground">
                          {record.area} • {record.yield}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{record.profit}</p>
                      <Badge variant="secondary">Completed</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="yields" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Yield Performance vs AI Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={yieldData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="season" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="wheat" stroke="var(--color-wheat)" strokeWidth={2} />
                    <Line type="monotone" dataKey="rice" stroke="var(--color-rice)" strokeWidth={2} />
                    <Line type="monotone" dataKey="corn" stroke="var(--color-corn)" strokeWidth={2} />
                    <Line type="monotone" dataKey="predicted" stroke="var(--color-predicted)" strokeWidth={2} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-700">Best Performers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Corn 2023</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">58 quintals/ha</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Rice 2023</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">46 quintals/ha</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Wheat 2023</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">38 quintals/ha</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-blue-700">AI Accuracy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Prediction Accuracy</span>
                    <span>92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                <p className="text-sm text-muted-foreground">
                  AI predictions are becoming more accurate as we collect more data from your farm.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-purple-700">Improvement Areas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Wheat yield</span>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">+8% potential</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Cost efficiency</span>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">-5% costs</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={profitData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="revenue" fill="var(--color-revenue)" />
                    <Bar dataKey="cost" fill="var(--color-cost)" />
                    <Bar dataKey="profit" fill="var(--color-profit)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">₹8.75L</p>
                <p className="text-xs text-green-600">+38% growth</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground">Total Costs</p>
                <p className="text-3xl font-bold text-orange-600">₹5.85L</p>
                <p className="text-xs text-orange-600">+17% increase</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground">Net Profit</p>
                <p className="text-3xl font-bold text-primary">₹2.90L</p>
                <p className="text-xs text-green-600">+100% growth</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sustainability" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-green-500" />
                  Soil Health Improvement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Organic Matter</span>
                    <span>+15%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>pH Balance</span>
                    <span>+8%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Nutrient Density</span>
                    <span>+12%</span>
                  </div>
                  <Progress value={68} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  Resource Efficiency
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Water Usage</span>
                    <span>-18%</span>
                  </div>
                  <Progress value={82} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Fertilizer Efficiency</span>
                    <span>+22%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Energy Conservation</span>
                    <span>-12%</span>
                  </div>
                  <Progress value={72} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sustainability Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-6xl font-bold text-green-600 mb-2">8.5/10</div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">Excellent</Badge>
                <p className="text-sm text-muted-foreground mt-4">
                  Your farming practices show strong commitment to sustainability with continuous improvement over the past 3 years.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rotation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Crop Rotation Pattern</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg text-center">
                    <h3 className="font-semibold">2021</h3>
                    <p className="text-sm text-muted-foreground">Wheat → Rice</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <h3 className="font-semibold">2022</h3>
                    <p className="text-sm text-muted-foreground">Barley → Corn</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <h3 className="font-semibold">2023</h3>
                    <p className="text-sm text-muted-foreground">Wheat → Rice</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center bg-primary/5">
                    <h3 className="font-semibold">2024</h3>
                    <p className="text-sm text-primary">Recommended: Legumes</p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">AI Recommendation</h4>
                  <p className="text-sm text-blue-700">
                    Consider introducing legumes (beans/peas) in 2024 to naturally fix nitrogen and improve soil health. 
                    This will reduce fertilizer costs and increase yields for subsequent crops.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FarmHistory;