import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LocationInputProps {
  onLocationSet: (location: { lat: number; lng: number; address: string }) => void;
}

export const LocationInput = ({ onLocationSet }: LocationInputProps) => {
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGPSLocation = () => {
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
      (position) => {
        const { latitude, longitude } = position.coords;
        onLocationSet({
          lat: latitude,
          lng: longitude,
          address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        });
        toast({
          title: "Location detected",
          description: "GPS location set successfully",
        });
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

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    // For demo purposes, set a default location
    // In real implementation, this would geocode the address
    onLocationSet({
      lat: 28.6139, // Delhi coordinates as example
      lng: 77.2090,
      address: address,
    });
    
    toast({
      title: "Location set",
      description: `Using location: ${address}`,
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
              placeholder="Enter your village/city name"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" variant="earth" className="w-full">
            Set Location
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};