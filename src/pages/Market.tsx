import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calculator, 
  Bell, 
  Search,
  Filter,
  Download
} from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";

const priceData = [
  { month: "Jan", wheat: 2200, rice: 2800, corn: 1800 },
  { month: "Feb", wheat: 2350, rice: 2900, corn: 1850 },
  { month: "Mar", wheat: 2400, rice: 3100, corn: 1900 },
  { month: "Apr", wheat: 2600, rice: 3300, corn: 2000 },
  { month: "May", wheat: 2550, rice: 3250, corn: 1950 },
  { month: "Jun", wheat: 2700, rice: 3400, corn: 2100 },
];

const marketData = [
  { crop: "Wheat", currentPrice: 2700, change: 5.2, volume: "1.2K tons", trend: "up" },
  { crop: "Rice", currentPrice: 3400, change: -2.1, volume: "890 tons", trend: "down" },
  { crop: "Corn", currentPrice: 2100, change: 7.8, volume: "750 tons", trend: "up" },
  { crop: "Barley", currentPrice: 2350, change: 3.4, volume: "420 tons", trend: "up" },
  { crop: "Mustard", currentPrice: 5200, change: -1.5, volume: "320 tons", trend: "down" },
  { crop: "Sorghum", currentPrice: 1950, change: 4.2, volume: "380 tons", trend: "up" },
];

const chartConfig = {
  wheat: {
    label: "Wheat (₹/quintal)",
    color: "hsl(var(--chart-1))",
  },
  rice: {
    label: "Rice (₹/quintal)",
    color: "hsl(var(--chart-2))",
  },
  corn: {
    label: "Corn (₹/quintal)",
    color: "hsl(var(--chart-3))",
  },
};

const Market = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Market Analytics</h1>
          <p className="text-muted-foreground">
            Real-time crop prices, trends, and profitability analysis
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Bell className="w-4 h-4 mr-2" />
            Set Alerts
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Market Price</p>
                <p className="text-2xl font-bold">₹2,847</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +3.2% from last week
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Best Performing</p>
                <p className="text-2xl font-bold">Corn</p>
                <p className="text-xs text-green-600">+7.8% this week</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Volume</p>
                <p className="text-2xl font-bold">4.2K</p>
                <p className="text-xs text-muted-foreground">tons traded today</p>
              </div>
              <Calculator className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Markets</p>
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-muted-foreground">mandis reporting</p>
              </div>
              <Search className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input placeholder="Search for crops..." className="w-full" />
            </div>
            <Select>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Select Market" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Markets</SelectItem>
                <SelectItem value="delhi">Delhi</SelectItem>
                <SelectItem value="punjab">Punjab</SelectItem>
                <SelectItem value="haryana">Haryana</SelectItem>
                <SelectItem value="rajasthan">Rajasthan</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="prices" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="prices">Current Prices</TabsTrigger>
          <TabsTrigger value="trends">Price Trends</TabsTrigger>
          <TabsTrigger value="calculator">Profit Calculator</TabsTrigger>
          <TabsTrigger value="forecast">Demand Forecast</TabsTrigger>
        </TabsList>

        <TabsContent value="prices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Market Prices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {marketData.map((item) => (
                  <div key={item.crop} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-semibold">{item.crop}</h3>
                        <p className="text-sm text-muted-foreground">Volume: {item.volume}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">₹{item.currentPrice.toLocaleString()}</p>
                      <div className="flex items-center gap-1">
                        {item.trend === "up" ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-sm ${item.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.change > 0 ? '+' : ''}{item.change}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>6-Month Price Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={priceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="wheat" stroke="var(--color-wheat)" strokeWidth={2} />
                    <Line type="monotone" dataKey="rice" stroke="var(--color-rice)" strokeWidth={2} />
                    <Line type="monotone" dataKey="corn" stroke="var(--color-corn)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculator" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Profitability Calculator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Select Crop</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose crop" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wheat">Wheat</SelectItem>
                      <SelectItem value="rice">Rice</SelectItem>
                      <SelectItem value="corn">Corn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Farm Size (hectares)</label>
                  <Input type="number" placeholder="Enter size" />
                </div>
                <div>
                  <label className="text-sm font-medium">Expected Yield (quintals/hectare)</label>
                  <Input type="number" placeholder="Enter yield" />
                </div>
                <div>
                  <label className="text-sm font-medium">Total Costs (₹)</label>
                  <Input type="number" placeholder="Enter costs" />
                </div>
                <Button className="w-full">Calculate Profit</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profit Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Expected Revenue</p>
                  <p className="text-3xl font-bold text-green-600">₹1,35,000</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Costs</p>
                  <p className="text-3xl font-bold text-red-600">₹85,000</p>
                </div>
                <div className="text-center border-t pt-4">
                  <p className="text-sm text-muted-foreground">Net Profit</p>
                  <p className="text-4xl font-bold text-primary">₹50,000</p>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 mt-2">
                    58.8% Profit Margin
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Market Demand Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={priceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="wheat" fill="var(--color-wheat)" />
                    <Bar dataKey="rice" fill="var(--color-rice)" />
                    <Bar dataKey="corn" fill="var(--color-corn)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-700">High Demand</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Wheat</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">↑ 15%</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Corn</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">↑ 12%</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-yellow-700">Stable Demand</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Barley</span>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">→ 2%</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Mustard</span>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">→ 1%</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-700">Declining Demand</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Rice</span>
                  <Badge variant="destructive">↓ 8%</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Cotton</span>
                  <Badge variant="destructive">↓ 5%</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Market;