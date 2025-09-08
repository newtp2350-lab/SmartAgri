import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Sprout, 
  TrendingUp, 
  DollarSign, 
  Leaf, 
  Droplets, 
  Calendar,
  Star,
  AlertCircle
} from "lucide-react";

interface RecommendationResultsProps {
  data: any;
}

export const RecommendationResults = ({ data }: RecommendationResultsProps) => {
  // Demo recommendations based on form data
  const recommendations = [
    {
      crop: "Tomato",
      confidence: 92,
      expectedYield: "15-20 tons/acre",
      profitMargin: "₹80,000 - ₹1,20,000",
      sustainabilityScore: 85,
      season: "Rabi/Summer",
      marketPrice: "₹25-35 per kg",
      reasons: [
        "Excellent match for your soil type",
        "High market demand in your region",
        "Good water efficiency",
        "Suitable for your farm size"
      ]
    },
    {
      crop: "Onion",
      confidence: 88,
      expectedYield: "25-30 tons/acre",
      profitMargin: "₹60,000 - ₹90,000",
      sustainabilityScore: 78,
      season: "Kharif",
      marketPrice: "₹20-30 per kg",
      reasons: [
        "Strong export potential",
        "Lower water requirements",
        "Good storage options",
        "Stable market prices"
      ]
    },
    {
      crop: "Green Gram (Moong)",
      confidence: 85,
      expectedYield: "8-12 quintals/acre",
      profitMargin: "₹40,000 - ₹60,000",
      sustainabilityScore: 95,
      season: "Summer",
      marketPrice: "₹70-90 per kg",
      reasons: [
        "Nitrogen-fixing crop",
        "Improves soil health",
        "Short growing period",
        "Good rotation crop"
      ]
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="shadow-soft">
        <CardHeader className="bg-gradient-hero text-primary-foreground rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Sprout className="w-5 h-5" />
            Smart Crop Recommendations for {data?.location?.address}
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid gap-6">
        {recommendations.map((rec, index) => (
          <Card key={index} className="shadow-soft hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Leaf className="w-5 h-5" />
                  {rec.crop}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    <Star className="w-3 h-3 mr-1" />
                    {rec.confidence}% Match
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={`${rec.sustainabilityScore >= 90 ? 'border-green-500 text-green-700' : 
                                rec.sustainabilityScore >= 80 ? 'border-yellow-500 text-yellow-700' : 
                                'border-orange-500 text-orange-700'}`}
                  >
                    Sustainability: {rec.sustainabilityScore}%
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-accent" />
                  <div>
                    <p className="text-sm font-medium">Expected Yield</p>
                    <p className="text-sm text-muted-foreground">{rec.expectedYield}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Profit Potential</p>
                    <p className="text-sm text-muted-foreground">{rec.profitMargin}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Best Season</p>
                    <p className="text-sm text-muted-foreground">{rec.season}</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-accent" />
                  Current Market Price
                </h4>
                <p className="text-sm text-muted-foreground">{rec.marketPrice}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Why This Crop?</h4>
                <ul className="space-y-1">
                  {rec.reasons.map((reason, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-accent/10 border-accent/30 shadow-soft">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-accent mt-0.5" />
            <div>
              <h4 className="font-medium text-foreground">Important Note</h4>
              <p className="text-sm text-muted-foreground mt-1">
                These are demo recommendations. For actual agricultural advice, this platform would integrate with real-time soil, weather, and market data APIs through Supabase backend integration.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};