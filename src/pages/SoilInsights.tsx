import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  TestTube, 
  Droplets, 
  Leaf, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  MapPin,
  Download,
  Loader2,
  RefreshCw
} from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";
import { fetchSoilData, SoilData, interpretSoilPH, interpretOrganicCarbon, interpretSoilTexture } from "@/api/soilgrids";
import OpenRouterService from "@/services/OpenRouterService";
import { useLocation } from "@/hooks/use-location";

const baseSoilHealthData = [
  { nutrient: "Nitrogen", value: 65, optimal: 80 },
  { nutrient: "Phosphorus", value: 45, optimal: 60 },
  { nutrient: "Potassium", value: 75, optimal: 70 },
  { nutrient: "pH Level", value: 60, optimal: 70 },
  { nutrient: "Organic Matter", value: 50, optimal: 65 },
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
  const { location, isLoading: locationLoading } = useLocation();
  const [soilData, setSoilData] = useState<SoilData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bestCrops, setBestCrops] = useState<string[]>([]);
  const [cropScores, setCropScores] = useState<Record<string, number>>({});
  const [aiSummary, setAiSummary] = useState<string | null>(null);


  // Fetch soil data when location changes
  useEffect(() => {
    if (location) {
      // reset state so UI doesn't show stale suitability from previous address
      setSoilData(null);
      setBestCrops([]);
      setCropScores({});
      setAiSummary(null);
      fetchSoilDataFromAPI();
    }
  }, [location]);

  const fetchSoilDataFromAPI = async () => {
    if (!location) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching soil data for location:', location);
      const data = await fetchSoilData(location.lat, location.lng);
      setSoilData(data);
      console.log('Soil data fetched successfully:', data);

      // Compute and persist best crops for this location based on soil properties
      const rankedPairs = computeBestCropsForSoil(data);
      const ranked = rankedPairs.map(r => r.crop);
      setBestCrops(ranked);
      setCropScores(Object.fromEntries(rankedPairs.map(r => [r.crop, r.score])));
      try {
        const key = `bestCropsForLocation:${location.address}`;
        localStorage.setItem(key, JSON.stringify(ranked));
      } catch {}

      // Fire-and-forget: ask AI for a short fertilizer summary tailored to soil only
      generateAiSummary(location.address, data).catch(() => {});
    } catch (err) {
      console.error('Error fetching soil data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch soil data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchSoilDataFromAPI();
  };

  // Show location required message
  if (!location && !locationLoading) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Soil Insights</h1>
          <p className="text-muted-foreground">
            Detailed soil analysis and health recommendations for your farm
          </p>
        </div>
        </div>
        
        <Alert>
          <MapPin className="h-4 w-4" />
          <AlertDescription>
            Please set your farm location on the homepage to view soil insights for your area.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isFiniteNumber = (n: unknown) => typeof n === 'number' && Number.isFinite(n);
  const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
  const fmt = (n: number | undefined, suffix = '') => isFiniteNumber(n) ? `${n}${suffix}` : '--';
  const fmtPH = (n: number | undefined) => isFiniteNumber(n) ? `${n}` : '--';

  // Compute a safe health score only when values are present
  const healthScore = soilData && isFiniteNumber(soilData.ph) && isFiniteNumber(soilData.organicCarbon) && isFiniteNumber(soilData.sandPercent)
    ? Number((
        (
          // pH ideal band ~6.0-7.5
          40 * clamp01(1 - Math.abs((soilData.ph as number) - 6.8) / 2) +
          // organic carbon ideal ~2-3%
          35 * clamp01((soilData.organicCarbon as number) / 3) +
          // texture balance: sand near 40-60
          25 * clamp01(1 - Math.abs((soilData.sandPercent as number) - 50) / 50)
        )
        / 10
      ).toFixed(1))
    : null;

  // Build dynamic chart data from soil values (normalize to 0-100)
  const dynamicSoilData = (() => {
    // Start with a clone of the base schema
    let data = [...baseSoilHealthData.map(d => ({ ...d }))];

    // Compute scores available from SoilGrids (pH and organic carbon)
    if (soilData) {
      const phScore = isFiniteNumber(soilData.ph)
        ? clamp01(1 - Math.abs((soilData.ph as number) - 6.8) / 2) * 100
        : undefined;
      const ocScore = isFiniteNumber(soilData.organicCarbon)
        ? clamp01((soilData.organicCarbon as number) / 3) * 100
        : undefined;

      if (isFiniteNumber(phScore)) {
        const phItem = data.find(d => d.nutrient === 'pH Level');
        if (phItem) phItem.value = Math.round(phScore as number);
      }
      if (isFiniteNumber(ocScore)) {
        const ocItem = data.find(d => d.nutrient === 'Organic Matter');
        if (ocItem) ocItem.value = Math.round(ocScore as number);
      }
    }

    // Hide N-P-K if not available from API
    const hasNitrogen = isFiniteNumber((soilData as any)?.nitrogen);
    const hasPhosphorus = isFiniteNumber((soilData as any)?.phosphorus);
    const hasPotassium = isFiniteNumber((soilData as any)?.potassium);

    data = data.filter(item => {
      if (item.nutrient === 'Nitrogen') return hasNitrogen;
      if (item.nutrient === 'Phosphorus') return hasPhosphorus;
      if (item.nutrient === 'Potassium') return hasPotassium;
      return true;
    });

    return data;
  })();

  // Flags for available properties
  const hasPH = !!(soilData && isFiniteNumber(soilData.ph));
  const hasOC = !!(soilData && isFiniteNumber(soilData.organicCarbon));
  const hasSand = !!(soilData && isFiniteNumber(soilData.sandPercent));
  const hasClay = !!(soilData && isFiniteNumber(soilData.clayPercent));
  const hasSilt = !!(soilData && isFiniteNumber(soilData.siltPercent));

  // Helper: rank crops using simple rules from pH, OC and texture
  function computeBestCropsForSoil(sd: SoilData | null): { crop: string; score: number }[] {
    if (!sd) return [];
    const ph = sd.ph;
    const texture = interpretSoilTexture(sd.sandPercent, sd.clayPercent, sd.siltPercent);
    const oc = sd.organicCarbon;
    const candidates = [
      'Wheat','Rice','Maize','Mustard','Groundnut','Barley','Sorghum','Sunflower','Cotton','Potato'
    ];
    const score: Record<string, number> = {};
    candidates.forEach(c => { score[c] = 0; });
    const add = (c: string, s: number) => { if (score[c] !== undefined) score[c] += s; };
    // pH contributions
    candidates.forEach(c => {
      const ranges: Record<string, [number, number]> = {
        Wheat: [6.0,7.5], Rice: [6.0,7.0], Maize:[6.0,7.0], Mustard:[6.0,7.5],
        Groundnut:[6.0,7.0], Barley:[6.0,7.5], Sorghum:[6.0,7.5], Sunflower:[6.0,7.5],
        Cotton:[6.0,7.5], Potato:[5.5,6.5]
      } as any;
      const r = (ranges as any)[c] as [number,number] | undefined;
      if (r && typeof ph === 'number') {
        if (ph >= r[0] && ph <= r[1]) add(c, 40);
        else if (ph >= r[0]-0.5 && ph <= r[1]+0.5) add(c, 20);
      }
    });
    // Organic carbon preference (higher better for many crops)
    if (typeof oc === 'number') {
      candidates.forEach(c => add(c, Math.min(oc,3) / 3 * 20));
    }
    // Texture preferences
    const prefers: Record<string,string[]> = {
      Rice:['Clay','Clay Loam'], Groundnut:['Sandy','Sandy Loam'], Wheat:['Loam','Clay Loam'],
      Maize:['Loam','Sandy Loam'], Sugarcane:['Loam','Clay Loam'], Potato:['Sandy Loam','Loam'],
      Cotton:['Loam','Sandy Loam'], Mustard:['Loam','Clay Loam'], Sorghum:['Loam','Sandy Loam'],
      Barley:['Loam','Clay Loam']
    } as any;
    candidates.forEach(c => { if ((prefers as any)[c]?.some((t:string)=> (texture||'').includes(t))) add(c, 20); });
    const pairs = candidates.map(c => ({ crop: c, score: score[c] ?? 0 }))
      .sort((a,b)=> b.score - a.score);
    return pairs;
  }

  async function generateAiSummary(address: string, sd: SoilData) {
    try {
      const contextString = `LOCATION: ${address}\nSOIL DATA: pH=${sd.ph}, OrganicCarbon=${sd.organicCarbon}%, Texture=${interpretSoilTexture(sd.sandPercent, sd.clayPercent, sd.siltPercent)}.`;
      const msg = 'Give 3 brief, bullet-point fertilizer tips strictly based on the soil data above.';
      const text = await OpenRouterService.chat(msg, { contextString });
      setAiSummary(text);
    } catch {}
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Soil Insights</h1>
          <p className="text-muted-foreground">
            Detailed soil analysis and health recommendations for your farm
            {location && (
              <span className="block text-sm text-primary">
                📍 {location.address}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Analysis
        </Button>
      </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Loading soil data from SoilGrids API...
          </AlertDescription>
        </Alert>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Soil Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Overall Soil Health Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          {soilData && healthScore !== null ? (
          <div className="flex items-center gap-6">
            <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {healthScore}/10
                </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">Good</Badge>
            </div>
            <div className="flex-1">
                <Progress value={healthScore * 10} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2">
                  Based on pH level (${fmtPH(soilData.ph)}), organic carbon (${fmt(soilData.organicCarbon, '%')}), and soil texture analysis
              </p>
            </div>
          </div>
          ) : (
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-muted-foreground mb-2">--/10</div>
                <Badge variant="secondary">Loading...</Badge>
              </div>
              <div className="flex-1">
                <Progress value={0} className="h-3" />
                <p className="text-sm text-muted-foreground mt-2">Soil data will appear here once loaded.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Key Soil Properties (render only available values) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {hasPH && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">pH Level</p>
                <p className="text-2xl font-bold">{soilData ? fmtPH(soilData.ph) : '--'}</p>
                <p className="text-xs text-green-600">
                  {soilData ? interpretSoilPH(soilData.ph) : 'Loading...'}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <TestTube className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        )}
        
        {hasOC && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Organic Carbon</p>
                <p className="text-2xl font-bold">{soilData ? fmt(soilData.organicCarbon, '%') : '--'}</p>
                <p className="text-xs text-yellow-600">
                  {soilData ? interpretOrganicCarbon(soilData.organicCarbon) : 'Loading...'}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Leaf className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        )}
        
        {hasSand && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sand Content</p>
                <p className="text-2xl font-bold">{soilData ? fmt(soilData.sandPercent, '%') : '--'}</p>
                <p className="text-xs text-orange-600">Sand</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        )}
        
        {(hasSand || hasClay || hasSilt) && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Soil Texture</p>
                <p className="text-2xl font-bold">
                  {soilData ? interpretSoilTexture(soilData.sandPercent, soilData.clayPercent, soilData.siltPercent) : '--'}
                </p>
                <p className="text-xs text-green-600">
                  {soilData ? `${fmt(soilData.clayPercent, '%')} clay, ${fmt(soilData.siltPercent, '%')} silt` : 'Loading...'}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        )}
      </div>

      {/* Simple List Format - Soil Data Summary */}
      {soilData && (hasPH || hasOC || hasSand || hasClay || hasSilt) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="w-5 h-5" />
              Soil Data Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {hasPH && (
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="font-medium">Soil pH:</span>
                  <span className="text-primary font-semibold">{fmtPH(soilData.ph)} ({interpretSoilPH(soilData.ph)})</span>
                </div>
              )}
              {hasOC && (
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="font-medium">Organic Carbon:</span>
                  <span className="text-primary font-semibold">{fmt(soilData.organicCarbon, '%')} ({interpretOrganicCarbon(soilData.organicCarbon)})</span>
                </div>
              )}
              {hasSand && (
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="font-medium">Sand %:</span>
                  <span className="text-primary font-semibold">{fmt(soilData.sandPercent, '%')}</span>
                </div>
              )}
              {hasClay && (
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="font-medium">Clay %:</span>
                  <span className="text-primary font-semibold">{fmt(soilData.clayPercent, '%')}</span>
                </div>
              )}
              {hasSilt && (
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="font-medium">Silt %:</span>
                  <span className="text-primary font-semibold">{fmt(soilData.siltPercent, '%')}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-2">
                <span className="font-medium">Soil Texture:</span>
                <span className="text-primary font-semibold">{interpretSoilTexture(soilData.sandPercent, soilData.clayPercent, soilData.siltPercent)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={dynamicSoilData}>
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
                {dynamicSoilData.map((item) => (
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
                {aiSummary && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2">AI Summary</h4>
                    <div className="text-sm text-green-800 whitespace-pre-line">{aiSummary}</div>
                  </div>
                )}
                {/* Dynamic tips based on pH */}
                {hasPH && soilData && (soilData.ph as number) < 6.0 && (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-yellow-800 mb-2">Raise Soil pH</h4>
                    <p className="text-sm text-yellow-700">Apply agricultural lime; target pH 6.5–7.0 for balanced nutrient availability.</p>
                  </div>
                )}
                {hasPH && soilData && (soilData.ph as number) > 7.5 && (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-yellow-800 mb-2">Lower Soil pH</h4>
                    <p className="text-sm text-yellow-700">Incorporate elemental sulfur or acidifying fertilizers; add organic matter.</p>
                </div>
                )}

                {/* Organic carbon guidance */}
                {hasOC && soilData && (soilData.organicCarbon as number) < 1.5 && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">Boost Organic Carbon</h4>
                    <p className="text-sm text-blue-700">Add compost/manure, retain residues, and include cover crops to improve structure.</p>
                  </div>
                )}
                {hasOC && soilData && (soilData.organicCarbon as number) >= 1.5 && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2">Maintain Organic Matter</h4>
                    <p className="text-sm text-green-700">Continue residue retention and minimal tillage to preserve carbon levels.</p>
                </div>
                )}

                {/* Texture-based irrigation tip */}
                {(hasSand || hasClay) && (
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h4 className="font-semibold text-orange-800 mb-2">Irrigation Strategy</h4>
                    <p className="text-sm text-orange-700">
                      {hasSand && soilData && (soilData.sandPercent as number) > 60
                        ? 'Sandy soils drain quickly—use lighter, more frequent irrigation.'
                        : 'Finer soils hold water longer—use deeper, less frequent irrigation.'}
                  </p>
                </div>
                )}
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
                {hasPH && soilData && (soilData.ph as number) > 7.8 && (
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h4 className="font-semibold text-orange-800 mb-2">High pH Caution</h4>
                    <p className="text-sm text-orange-700">Avoid lime; prefer acidifying fertilizers like ammonium sulfate.</p>
                </div>
                )}
                {(hasClay && soilData && (soilData.clayPercent as number) > 35) && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <h4 className="font-semibold text-red-800 mb-2">Compaction Risk</h4>
                    <p className="text-sm text-red-700">Avoid field operations when wet; add organic matter to improve structure.</p>
                </div>
                )}
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
                {(() => {
                  const items: { name: string; match: string }[] = [];
                  const ph = soilData?.ph as number | undefined;
                  const sand = soilData?.sandPercent as number | undefined;
                  const texture = soilData ? interpretSoilTexture(soilData.sandPercent, soilData.clayPercent, soilData.siltPercent) : 'Unknown';
                  if (isFiniteNumber(ph) && ph >= 6 && ph <= 7.5 && texture !== 'Clay') {
                    items.push({ name: 'Wheat', match: '95% Match' });
                    items.push({ name: 'Barley', match: '92% Match' });
                  }
                  if (isFiniteNumber(sand) && sand && sand >= 40 && sand <= 60) {
                    items.push({ name: 'Mustard', match: '88% Match' });
                  }
                  return items.length ? items.map(i => (
                    <div key={i.name} className="flex items-center justify-between">
                      <span>{i.name}</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">{i.match}</Badge>
                </div>
                  )) : <p className="text-muted-foreground">No strong matches for current soil properties.</p>;
                })()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-yellow-700">Moderately Suitable</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(() => {
                  const items: { name: string; match: string }[] = [];
                  const ph = soilData?.ph as number | undefined;
                  if (isFiniteNumber(ph) && (ph < 6 || ph > 7.5)) {
                    items.push({ name: 'Sorghum', match: '72% Match' });
                  } else {
                    items.push({ name: 'Corn', match: '75% Match' });
                    items.push({ name: 'Sunflower', match: '68% Match' });
                  }
                  return items.map(i => (
                    <div key={i.name} className="flex items-center justify-between">
                      <span>{i.name}</span>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{i.match}</Badge>
                </div>
                  ));
                })()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-700">Not Recommended</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(() => {
                  const items: { name: string; match: string }[] = [];
                  const texture = soilData ? interpretSoilTexture(soilData.sandPercent, soilData.clayPercent, soilData.siltPercent) : 'Unknown';
                  if (texture === 'Sand' || texture === 'Loamy Sand') {
                    items.push({ name: 'Rice', match: '45% Match' });
                    items.push({ name: 'Sugarcane', match: '38% Match' });
                  }
                  items.push({ name: 'Cotton', match: '42% Match' });
                  return items.map(i => (
                    <div key={i.name} className="flex items-center justify-between">
                      <span>{i.name}</span>
                      <Badge variant="destructive">{i.match}</Badge>
                </div>
                  ));
                })()}
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