import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Calculator, TrendingUp, Leaf, DollarSign } from "lucide-react";

interface AdvancedFormProps {
  location?: { lat: number; lng: number; address: string };
  onGenerateRecommendations: (data: any) => void;
  loading?: boolean;
}

export const AdvancedForm = ({ location, onGenerateRecommendations, loading }: AdvancedFormProps) => {
  const [formData, setFormData] = useState({
    landSize: "",
    soilType: "",
    previousCrops: "",
    budget: "",
    waterSource: "",
    additionalInfo: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerateRecommendations({
      ...formData,
      location,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-soft">
      <CardHeader className="bg-gradient-earth rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Calculator className="w-5 h-5" />
          Advanced Farm Analysis
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="landSize">Land Size (acres)</Label>
              <Input
                id="landSize"
                type="number"
                placeholder="e.g., 2.5"
                value={formData.landSize}
                onChange={(e) => handleInputChange("landSize", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="soilType">Soil Type</Label>
              <Select onValueChange={(value) => handleInputChange("soilType", value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select soil type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clay">Clay</SelectItem>
                  <SelectItem value="sandy">Sandy</SelectItem>
                  <SelectItem value="loamy">Loamy</SelectItem>
                  <SelectItem value="silty">Silty</SelectItem>
                  <SelectItem value="rocky">Rocky</SelectItem>
                  <SelectItem value="unknown">Not sure</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget (₹)</Label>
              <Input
                id="budget"
                type="number"
                placeholder="e.g., 50000"
                value={formData.budget}
                onChange={(e) => handleInputChange("budget", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="waterSource">Water Source</Label>
              <Select onValueChange={(value) => handleInputChange("waterSource", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select water source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rainfall">Rainfall only</SelectItem>
                  <SelectItem value="borewell">Borewell</SelectItem>
                  <SelectItem value="canal">Canal irrigation</SelectItem>
                  <SelectItem value="river">River/stream</SelectItem>
                  <SelectItem value="mixed">Multiple sources</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="previousCrops">Previous Crops (last season)</Label>
            <Input
              id="previousCrops"
              placeholder="e.g., wheat, rice, sugarcane"
              value={formData.previousCrops}
              onChange={(e) => handleInputChange("previousCrops", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalInfo">Additional Information</Label>
            <Textarea
              id="additionalInfo"
              placeholder="Any specific requirements, challenges, or questions..."
              value={formData.additionalInfo}
              onChange={(e) => handleInputChange("additionalInfo", e.target.value)}
              rows={3}
            />
          </div>

          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={!!loading}>
            <TrendingUp className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Generating...' : 'Generate Smart Recommendations'}
          </Button>
        </form>

        {!location && (
          <div className="mt-4 p-4 bg-accent/20 rounded-lg border border-accent/30">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Leaf className="w-4 h-4" />
              Set your location first for more accurate recommendations
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};