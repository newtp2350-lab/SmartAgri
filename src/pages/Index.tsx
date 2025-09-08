import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LocationInput } from "@/components/LocationInput";
import { ChatInterface } from "@/components/ChatInterface";
import { AdvancedForm } from "@/components/AdvancedForm";
import { RecommendationResults } from "@/components/RecommendationResults";
import Layout from "@/components/Layout";
import { 
  Sprout, 
  MessageSquare, 
  Calculator, 
  MapPin, 
  Sun, 
  Droplets, 
  TrendingUp,
  Wheat,
  Smartphone,
  Brain
} from "lucide-react";
import heroImage from "@/assets/hero-agriculture.jpg";

const Index = () => {
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState("normal");

  const handleLocationSet = (loc: { lat: number; lng: number; address: string }) => {
    setLocation(loc);
  };

  const handleGenerateRecommendations = (data: any) => {
    setRecommendations(data);
  };

  if (!location) {
    return (
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70" />
          
          <div className="relative z-10 container mx-auto px-4 py-20">
            <div className="max-w-4xl mx-auto text-center text-primary-foreground">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
                SmartAgri Advisor
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90 animate-fade-in">
                AI-powered farming intelligence for smarter crop decisions
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-12 animate-fade-in">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <Brain className="w-5 h-5" />
                  <span>AI Recommendations</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <Sun className="w-5 h-5" />
                  <span>Weather Insights</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Market Analysis</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <Wheat className="w-5 h-5" />
                  <span>Soil Intelligence</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Location Setup */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-primary mb-4">Get Started</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                First, let us know your farm location to provide personalized recommendations
              </p>
            </div>
            <LocationInput onLocationSet={handleLocationSet} />
          </div>
        </section>

        {/* Features Preview */}
        <section className="py-20 bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-primary mb-4">How SmartAgri Helps You</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card className="shadow-soft hover:shadow-glow transition-all duration-300">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <CardTitle>Ask Anything</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    Get instant answers about crops, soil, weather, and market prices in simple language
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-soft hover:shadow-glow transition-all duration-300">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calculator className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <CardTitle>Smart Analysis</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    Detailed farm analysis with crop recommendations, yield forecasts, and profit calculations
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-soft hover:shadow-glow transition-all duration-300">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <CardTitle>Always Available</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    Access agricultural expertise 24/7 from any device, even with limited internet connectivity
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <Layout location={location} onLocationChange={() => setLocation(null)}>
      <div className="space-y-6">
      {/* Header */}
      <header className="bg-gradient-hero text-primary-foreground shadow-soft">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sprout className="w-8 h-8" />
              <h1 className="text-2xl font-bold">SmartAgri Advisor</h1>
            </div>
            <div className="flex items-center gap-2 text-sm bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <MapPin className="w-4 h-4" />
              <span>{location.address}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setLocation(null)}
                className="text-primary-foreground hover:bg-white/20 ml-2"
              >
                Change
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {recommendations ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-primary">Your Recommendations</h2>
              <Button 
                variant="outline" 
                onClick={() => setRecommendations(null)}
              >
                Generate New Analysis
              </Button>
            </div>
            <RecommendationResults data={recommendations} />
          </div>
        ) : (
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="normal" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Normal Search
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Advanced Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="normal" className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-primary mb-2">Ask Your Agricultural Questions</h2>
                <p className="text-muted-foreground">
                  Get instant answers about farming, crops, soil, weather, and markets
                </p>
              </div>
              <ChatInterface location={location} />
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-primary mb-2">Detailed Farm Analysis</h2>
                <p className="text-muted-foreground">
                  Provide your farm details for comprehensive crop recommendations and profit analysis
                </p>
              </div>
              <AdvancedForm 
                location={location} 
                onGenerateRecommendations={handleGenerateRecommendations} 
              />
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Footer Note */}
      <footer className="bg-muted/30 border-t border-border mt-20">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            This is a demo interface. For full functionality with real agricultural data, connect to Supabase backend.
          </p>
        </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
