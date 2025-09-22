import { useState, useEffect } from "react";
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
  Download,
  MapPin,
  Loader2,
  RefreshCw
} from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";
import { WeatherService, WeatherData, WeatherForecast, HourlyForecast } from "@/services/WeatherService";
import { useLocation } from "@/hooks/use-location";

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
  pop: {
    label: "Precipitation (%)",
    color: "hsl(var(--chart-4))",
  },
};

const Weather = () => {
  const { location, isLoading: locationLoading } = useLocation();
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const fetchWeatherData = async () => {
    if (!location) {
      setError("Please set your location first");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [current, forecastData] = await Promise.all([
        WeatherService.getCurrent(location),
        WeatherService.getHourlyForecast(location)
      ]);
      
      setCurrentWeather(current);
      setForecast(forecastData);
    } catch (err) {
      console.error("Weather fetch error:", err);
      setError(`Failed to fetch weather data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location) {
      fetchWeatherData();
    }
  }, [location]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getHourlyChartData = () => {
    if (!forecast) return [];
    
    return forecast.list.slice(0, 24).map((item, index) => ({
      time: formatTime(item.dt),
      temp: Math.round(item.main.temp),
      humidity: item.main.humidity,
      pop: Math.round(item.pop * 100),
      wind: Math.round(item.wind.speed * 3.6), // Convert m/s to km/h
    }));
  };

  const getDailyChartData = () => {
    if (!forecast) return [];
    
    // Group by day and get daily averages
    const dailyData: { [key: string]: any } = {};
    
    forecast.list.forEach((item) => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!dailyData[date]) {
        dailyData[date] = {
          day: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
          temp: [],
          humidity: [],
          pop: [],
        };
      }
      dailyData[date].temp.push(item.main.temp);
      dailyData[date].humidity.push(item.main.humidity);
      dailyData[date].pop.push(item.pop * 100);
    });

    return Object.values(dailyData).map((day) => ({
      day: day.day,
      temp: Math.round(day.temp.reduce((a: number, b: number) => a + b, 0) / day.temp.length),
      humidity: Math.round(day.humidity.reduce((a: number, b: number) => a + b, 0) / day.humidity.length),
      rainfall: Math.round(day.pop.reduce((a: number, b: number) => a + b, 0) / day.pop.length),
    }));
  };

  // Helper functions for badge variants and text
  const getHeatStressVariant = () => {
    if (!currentWeather) return "outline";
    if (currentWeather.main.temp > 35) return "destructive";
    if (currentWeather.main.temp > 30) return "secondary";
    return "outline";
  };

  const getHeatStressText = () => {
    if (!currentWeather) return "Low";
    if (currentWeather.main.temp > 35) return "High";
    if (currentWeather.main.temp > 30) return "Moderate";
    return "Low";
  };

  const getWaterReqVariant = () => {
    if (!currentWeather) return "outline";
    if (currentWeather.main.humidity < 40) return "destructive";
    if (currentWeather.main.humidity < 60) return "secondary";
    return "outline";
  };

  const getWaterReqText = () => {
    if (!currentWeather) return "Low";
    if (currentWeather.main.humidity < 40) return "High";
    if (currentWeather.main.humidity < 60) return "Moderate";
    return "Low";
  };

  const getDiseaseRiskVariant = () => {
    if (!currentWeather) return "outline";
    if (currentWeather.main.humidity > 80) return "destructive";
    if (currentWeather.main.humidity > 70) return "secondary";
    return "outline";
  };

  const getDiseaseRiskText = () => {
    if (!currentWeather) return "Low";
    if (currentWeather.main.humidity > 80) return "High";
    if (currentWeather.main.humidity > 70) return "Moderate";
    return "Low";
  };
  if (!location) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold text-primary mb-2">Location Required</h2>
          <p className="text-muted-foreground mb-6">
            Please set your farm location to view weather analytics
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Set Location
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Weather Analytics</h1>
          <p className="text-muted-foreground">
            Current and forecasted weather patterns for your location {location.address}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchWeatherData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {(loading || locationLoading) && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mr-2" />
          <span>{locationLoading ? "Loading location..." : "Loading weather data..."}</span>
        </div>
      )}

      {/* Current Weather */}
      {currentWeather && (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Temperature</p>
                  <p className="text-2xl font-bold">{WeatherService.formatTemperature(currentWeather.main.temp)}</p>
                  <p className="text-xs text-muted-foreground">Feels like {WeatherService.formatTemperature(currentWeather.main.feels_like)}</p>
                </div>
                <div className="text-right">
                  <img 
                    src={WeatherService.getWeatherIconUrl(currentWeather.weather[0].icon)} 
                    alt={currentWeather.weather[0].description}
                    className="w-12 h-12"
                  />
                  <p className="text-xs text-muted-foreground capitalize">{currentWeather.weather[0].description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Humidity</p>
                  <p className="text-2xl font-bold">{currentWeather.main.humidity}%</p>
                  <p className="text-xs text-muted-foreground">Pressure: {currentWeather.main.pressure} hPa</p>
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
                  <p className="text-2xl font-bold">{Math.round(currentWeather.wind.speed * 3.6)} km/h</p>
                  <p className="text-xs text-muted-foreground">{WeatherService.getWindDirection(currentWeather.wind.deg)}</p>
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
                  <p className="text-2xl font-bold">{Math.round(currentWeather.visibility / 1000)} km</p>
                  <p className="text-xs text-muted-foreground">Last updated: {formatTime(currentWeather.dt)}</p>
              </div>
              <Eye className="w-8 h-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      )}

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

      {forecast && (
        <Tabs defaultValue="hourly" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="hourly">24-Hour Forecast</TabsTrigger>
            <TabsTrigger value="daily">5-Day Forecast</TabsTrigger>
          <TabsTrigger value="crop-impact">Crop Impact</TabsTrigger>
        </TabsList>

          <TabsContent value="hourly" className="space-y-4">
            {/* Side by side charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Temperature & Humidity (24 Hours)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={getHourlyChartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
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
                  <CardTitle>Precipitation Probability (24 Hours)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={getHourlyChartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="pop" fill="var(--color-pop)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Hourly Forecast Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {forecast.list.slice(0, 8).map((item, index) => (
                <Card key={item.dt}>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-sm font-medium">{formatTime(item.dt)}</p>
                      <img 
                        src={WeatherService.getWeatherIconUrl(item.weather[0].icon)} 
                        alt={item.weather[0].description}
                        className="w-8 h-8 mx-auto my-2"
                      />
                      <p className="text-lg font-bold">{WeatherService.formatTemperature(item.main.temp)}</p>
                      <p className="text-xs text-muted-foreground capitalize">{item.weather[0].description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {WeatherService.getPrecipitationProbability(item.pop)} chance of rain
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="daily" className="space-y-4">
            {/* Side by side charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
                  <CardTitle>Temperature & Humidity (5 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={getDailyChartData()}>
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
                  <CardTitle>Precipitation Forecast (5 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={getDailyChartData()}>
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
            </div>
        </TabsContent>

        <TabsContent value="crop-impact" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Crop Growth Impact
                </CardTitle>
              </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Heat Stress Risk</span>
                      <Badge variant={getHeatStressVariant()}>
                        {getHeatStressText()}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Water Requirements</span>
                      <Badge variant={getWaterReqVariant()}>
                        {getWaterReqText()}
                      </Badge>
                </div>
                    <div className="flex justify-between items-center">
                      <span>Disease Risk</span>
                      <Badge variant={getDiseaseRiskVariant()}>
                        {getDiseaseRiskText()}
                      </Badge>
                </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
              </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {currentWeather && currentWeather.main.temp > 35 && (
                      <p className="text-sm text-orange-600">• Apply shade netting immediately</p>
                    )}
                    {currentWeather && currentWeather.main.humidity < 40 && (
                      <p className="text-sm text-blue-600">• Increase irrigation frequency</p>
                    )}
                    {currentWeather && currentWeather.main.humidity > 80 && (
                      <p className="text-sm text-red-600">• Monitor for fungal diseases</p>
                    )}
                    {forecast && forecast.list.some(item => item.pop > 0.7) && (
                      <p className="text-sm text-yellow-600">• Prepare for heavy rainfall</p>
                    )}
                    <p className="text-sm text-gray-600">• Check soil moisture levels regularly</p>
                    <p className="text-sm text-gray-600">• Monitor crop health daily</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      )}
    </div>
  );
};

export default Weather;