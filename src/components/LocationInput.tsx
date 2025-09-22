import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation, Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GeocodingService, LocationSuggestion } from "@/services/GeocodingService";

interface LocationInputProps {
  onLocationSet: (location: { lat: number; lng: number; address: string }) => void;
}

export const LocationInput = ({ onLocationSet }: LocationInputProps) => {
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<LocationSuggestion | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Fetch location suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (address.length < 3) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsSearching(true);
      try {
        const results = await GeocodingService.getSuggestions(address);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.warn("Failed to fetch location suggestions:", error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [address]);

  // Handle clicks outside suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleGPSLocation = async () => {
    setIsLoading(true);
    
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Please enter your address manually",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const address = await GeocodingService.reverseGeocode(latitude, longitude);
          onLocationSet({
            lat: latitude,
            lng: longitude,
            address: address,
          });
          toast({
            title: "Location detected",
            description: "GPS location set successfully",
          });
        } catch (error) {
          onLocationSet({
            lat: latitude,
            lng: longitude,
            address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          });
          toast({
            title: "Location detected",
            description: "GPS location set successfully",
          });
        }
        setIsLoading(false);
      },
      (error) => {
        toast({
          title: "Location access denied",
          description: "Please enter your address manually",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    );
  };

  const handleSuggestionSelect = (suggestion: LocationSuggestion) => {
    setAddress(suggestion.formatted);
    setSelectedSuggestion(suggestion);
    setShowSuggestions(false);
    onLocationSet({
      lat: suggestion.lat,
      lng: suggestion.lng,
      address: suggestion.formatted,
    });
    toast({
      title: "Location set",
      description: `Using location: ${suggestion.formatted}`,
    });
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    if (selectedSuggestion) {
      // Already set via selection; nothing to do
      return;
    }

    // Do not allow free-text submissions. Force user to choose a suggestion.
    toast({
      title: "Please choose a suggestion",
      description: "Select a location from the dropdown list to continue.",
      variant: "destructive",
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto animate-fade-in shadow-soft">
      <CardHeader className="text-center pb-4">
        <CardTitle className="flex items-center justify-center gap-2 text-primary">
          <MapPin className="w-5 h-5" />
          Set Your Farm Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleGPSLocation}
          disabled={isLoading}
          variant="hero"
          size="lg"
          className="w-full"
        >
          <Navigation className="w-4 h-4" />
          {isLoading ? "Detecting..." : "Use GPS Location"}
        </Button>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <form onSubmit={handleAddressSubmit} className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              ref={inputRef}
              placeholder="Enter your village/city name"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                if (selectedSuggestion) setSelectedSuggestion(null);
              }}
              className="pl-10"
              autoComplete="off"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 animate-spin" />
            )}
            
            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-y-auto"
              >
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={`${suggestion.place_id || suggestion.formatted}-${idx}`}
                    type="button"
                    onClick={() => handleSuggestionSelect(suggestion)}
                    className="w-full px-4 py-3 text-left hover:bg-accent hover:text-accent-foreground border-b border-border last:border-b-0 focus:outline-none focus:bg-accent"
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {suggestion.formatted}
                        </p>
                        <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                          {suggestion.components.village && (
                            <span>{suggestion.components.village}</span>
                          )}
                          {suggestion.components.town && (
                            <span>{suggestion.components.town}</span>
                          )}
                          {suggestion.components.city && (
                            <span>{suggestion.components.city}</span>
                          )}
                          {suggestion.components.state && (
                            <span>{suggestion.components.state}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button type="submit" variant="earth" className="w-full" disabled={!selectedSuggestion}>
            Set Location
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};