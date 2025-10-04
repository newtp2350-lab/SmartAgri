import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import OpenRouterService from "@/services/OpenRouterService";
import { useEffect, useRef, useState } from "react";
import { fetchSoilData, interpretSoilTexture } from "@/api/soilgrids";
import { CROPS } from "../data/crops";
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
import { MarketService, getStateAndMarket } from "@/services/MarketService";
import LocalAIService from "@/services/LocalAIService";

interface RecommendationResultsProps {
  data: any;
}

type Rec = {
  crop: string;
  confidence?: number;
  expectedYield?: string;
  profitMargin?: string;
  sustainabilityScore?: number;
  season?: string;
  marketPrice?: string;
  reasons?: string[];
};

export const RecommendationResults = ({ data }: RecommendationResultsProps) => {
  const [aiPlan, setAiPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recs, setRecs] = useState<Rec[]>([]);
  const runIdRef = useRef(0);

  useEffect(() => {
    const run = async () => {
      if (!data) return;
      setLoading(true);
      const myRunId = ++runIdRef.current;
      try {
        // Fetch live soil to personalize if available
        let soilSummary = '';
        let sd: { ph?: number; organicCarbon?: number; sandPercent?: number; clayPercent?: number; siltPercent?: number } | null = null;
        let texture: string | undefined = undefined;
        try {
          if (data?.location?.lat && data?.location?.lng) {
            sd = await fetchSoilData(data.location.lat, data.location.lng);
            texture = interpretSoilTexture(sd.sandPercent, sd.clayPercent, sd.siltPercent);
            soilSummary = `Soil: pH=${sd.ph ?? 'NA'}, OC=${sd.organicCarbon ?? 'NA'}%, Texture=${texture}`;
          }
        } catch {}

        // Build lightweight knowledge appendix (no local scoring)
        const appendix = CROPS.slice(0, 16).map(c => (
          `${c.crop}: pH ${c.ph[0]}-${c.ph[1]}, textures ${c.textures.join('/')}, temp ${c.temperatureC?.[0] ?? '-'}-${c.temperatureC?.[1] ?? '-'}°C, season ${c.season}`
        )).join('\n');

        const system = 'You are SmartAgri Advisor. Return structured, data-driven results. Use the knowledge appendix to improve accuracy but always validate against live soil and weather.';
        const profile = `FARM PROFILE\n${data._contextString || ''}\n${soilSummary}\n\nKNOWLEDGE APPENDIX (for reference; do not assume without soil/weather match):\n${appendix}`;

        const jsonPrompt = `Task: Rank crops SPECIFIC to this farm.\nRules:\n- ONLY choose from this candidate list and KEEP the provided order unless agronomic data (pH/temp/water/texture) requires a change.\n- Tie decisions must be justified using soil/ weather/ market context.\n- Include 5–8 items.\nOutput (JSON ONLY): {\"crops\": [ {\"crop\": string, \"confidence\": number, \"expectedYield\": string, \"profitMargin\": string, \"sustainabilityScore\": number, \"season\": string, \"marketPrice\": string, \"reasons\": string[] } ] }\n\n${profile}`;

        let parsedOk = false;
        function extractJson(text: string): any | null {
          if (!text) return null;
          try { return JSON.parse(text); } catch {}
          const match = String(text).match(/[\{\[][\s\S]*[\}\]]/);
          if (match) { try { return JSON.parse(match[0]); } catch {} }
          return null;
        }

        try {
          let jsonText = await OpenRouterService.chat(jsonPrompt, { contextString: system });
          let parsed = extractJson(String(jsonText));
          if (!parsed) {
            // Retry once if parsing failed
            await new Promise(r => setTimeout(r, 400));
            jsonText = await OpenRouterService.chat(jsonPrompt, { contextString: system });
            parsed = extractJson(String(jsonText));
          }
          if (parsed && Array.isArray(parsed.crops)) {
            // Enrich with market prices to avoid blanks
            const enriched: Rec[] = await enrichWithMarketPrices(parsed.crops as Rec[]);
            if (myRunId === runIdRef.current) {
              setRecs(enriched);
              try { localStorage.setItem('adv_last_recs', JSON.stringify(enriched)); } catch {}
            }
            parsedOk = true;
          }
        } catch {}

        // Local fallback generator when AI JSON fails
        if (!parsedOk) {
          const suggestionsBase: Rec[] = [
            { crop: 'Wheat', confidence: 80, expectedYield: '-', profitMargin: '-', sustainabilityScore: 82, season: 'Rabi', marketPrice: '-', reasons: ['Good general fit'] },
            { crop: 'Maize', confidence: 78, expectedYield: '-', profitMargin: '-', sustainabilityScore: 80, season: 'Kharif/Rabi', marketPrice: '-', reasons: ['Adaptable crop'] },
            { crop: 'Groundnut', confidence: 75, expectedYield: '-', profitMargin: '-', sustainabilityScore: 79, season: 'Kharif', marketPrice: '-', reasons: ['Sandy soils preference'] },
          ];
          const suggestions = await enrichWithMarketPrices(suggestionsBase);
          if (myRunId === runIdRef.current) {
            setRecs(suggestions);
            try { localStorage.setItem('adv_last_recs', JSON.stringify(suggestions)); } catch {}
          }
          // If previous good recs exist, prefer them
          try {
            const last = localStorage.getItem('adv_last_recs');
            if (last && myRunId === runIdRef.current) setRecs(JSON.parse(last));
          } catch {}
        }

        try {
          const text = await OpenRouterService.chat('Create a clear step-by-step farm plan using the FARM PROFILE.', { contextString: `${system}\n\n${profile}` });
          if (myRunId === runIdRef.current) {
            setAiPlan(text);
            try { localStorage.setItem('adv_last_plan', text); } catch {}
          }
        } catch {
          // Fallback: use Local AI to always show a plan
          try {
            const fallback = await LocalAIService.chat('Create a clear step-by-step farm plan using the FARM PROFILE.', {
              location: data?.location,
              soil: sd ? { ...sd, texture } : undefined,
              weather: (data as any)?.weather
            });
            if (myRunId === runIdRef.current) {
              setAiPlan(fallback);
              try { localStorage.setItem('adv_last_plan', fallback); } catch {}
            }
          } catch {
            try {
              const last = localStorage.getItem('adv_last_plan');
              if (last && myRunId === runIdRef.current) setAiPlan(last);
            } catch {}
          }
        }
      } catch {
        setAiPlan('Unable to fetch AI plan right now. Please retry.');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [data]);

  // Clean AI Farm Plan formatting: remove markdown-only symbols (#, *) just for this section
  const cleanedPlan = (aiPlan || '')
    .replace(/[#*]+/g, '')
    .trim();

  // Helper: enrich recommendations with market prices
  async function enrichWithMarketPrices(items: Rec[]): Promise<Rec[]> {
    // Approximate yields per acre (quintals) and a simple profit factor
    const approxYieldQPerAcre: Record<string, [number, number]> = {
      'Wheat': [18, 22],
      'Rice': [18, 24],
      'Maize': [20, 25],
      'Groundnut': [7, 10],
      'Mustard': [6, 10],
      'Soybean': [8, 12],
      'Cotton': [8, 12],
      'Sorghum': [8, 12],
      'Barley': [16, 20],
      'Potato': [80, 120],
      'Tomato': [150, 250], // vegetables vary widely
    };

    const formatINR = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

    try {
      const address = (data as any)?.location?.address as string | undefined;
      const loc = address ? getStateAndMarket(address) : null;
      const state = loc?.state;
      const district = loc?.market;
      const enriched = await Promise.all(items.map(async (rec) => {
        try {
          if (!state || !district) return rec;
          const prices = await MarketService.getPrices({ commodity: rec.crop, state, district });
          if (prices && prices.length > 0) {
            const p = prices[0];
            const unitPrice = p.modelPrice || p.price || 0;
            const label = unitPrice ? `${formatINR(unitPrice)}/quintal` : undefined;

            // Fill approximate expected yield if missing
            let expectedYield = rec.expectedYield;
            let profitMargin = rec.profitMargin;
            const yieldRange = approxYieldQPerAcre[rec.crop];
            if (!expectedYield && yieldRange) {
              expectedYield = `${yieldRange[0]}–${yieldRange[1]} q/acre (approx)`;
            }
            if (!profitMargin && yieldRange && unitPrice) {
              const midYield = (yieldRange[0] + yieldRange[1]) / 2;
              const revenue = midYield * unitPrice; // per acre
              const lowProfit = revenue * 0.25; // simple margin heuristic
              const highProfit = revenue * 0.45;
              profitMargin = `${formatINR(lowProfit)}–${formatINR(highProfit)}/acre (approx)`;
            }

            return { ...rec, marketPrice: label || rec.marketPrice, expectedYield, profitMargin };
          }
          return rec;
        } catch {
          return rec;
        }
      }));
      return enriched;
    } catch {
      return items;
    }
  }
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

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>AI Farm Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm whitespace-pre-line">
            {loading ? 'Generating plan...' : (cleanedPlan || 'No plan generated.')}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {(recs.length ? recs : []).map((rec, index) => (
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
                    {rec.confidence ?? 80}% Match
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={`${(rec.sustainabilityScore ?? 0) >= 90 ? 'border-green-500 text-green-700' : 
                                (rec.sustainabilityScore ?? 0) >= 80 ? 'border-yellow-500 text-yellow-700' : 
                                'border-orange-500 text-orange-700'}`}
                  >
                    Sustainability: {rec.sustainabilityScore ?? 80}%
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
                    <p className="text-sm text-muted-foreground">{rec.expectedYield || '-'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Profit Potential</p>
                    <p className="text-sm text-muted-foreground">{rec.profitMargin || '-'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Best Season</p>
                    <p className="text-sm text-muted-foreground">{rec.season || '-'}</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-accent" />
                  Current Market Price
                </h4>
                <p className="text-sm text-muted-foreground">{rec.marketPrice || '-'}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Why This Crop?</h4>
                <ul className="space-y-1">
                  {(rec.reasons || []).map((reason, i) => (
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
        {(!recs || recs.length === 0) && (
          <Card className="shadow-soft">
            <CardContent className="p-6 text-sm text-muted-foreground">
              {loading ? 'Generating personalized recommendations...' : 'No recommendations available yet.'}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Important Note card removed per design request */}
    </div>
  );
};