import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  MapPin, 
  Bell, 
  Globe, 
  Download, 
  Trash2, 
  Shield,
  Smartphone,
  Database
} from "lucide-react";
import { DatabaseService, UserPreferences, Farm, UserProfile } from "@/services/DatabaseService";
import { toast } from "sonner";
import { INDIAN_STATES } from "@/data/states";
import { CROP_OPTIONS } from "../data/crops";

const Settings = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);


  // Form state
  const [formData, setFormData] = useState<{
    language: string;
    notifications: boolean;
  }>({
    language: "en",
    notifications: true
  });

  // Profile form state
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    state: '',
    district: ''
  });

  // Photo upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Farm form state
  const [farmData, setFarmData] = useState({
    name: '',
    area_ha: '',
    soil_type: '',
    irrigation: '',
    address: '',
    crops: [] as string[]
  });

  useEffect(() => {
    loadUserData();
  }, []);


  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const user = await DatabaseService.getCurrentUser();
      if (!user) {
        toast.error('Please log in to view settings');
        return;
      }

      const [prefsData, farmsData, profileData] = await Promise.all([
        DatabaseService.getUserPreferences(user.id),
        DatabaseService.getFarms(user.id),
        DatabaseService.getUserProfile(user.id)
      ]);

      setPreferences(prefsData);
      setFarms(farmsData);
      setUserProfile(profileData);

      if (prefsData) {
        setFormData({
          language: prefsData.language,
          notifications: prefsData.notifications
        });
      }

      if (profileData) {
        setProfileData({
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          email: profileData.email || user.email || '',
          phone: profileData.phone || '',
          state: profileData.state || '',
          district: profileData.district || ''
        });
      } else {
        // Set default values from auth user
        setProfileData({
          first_name: user.user_metadata?.first_name || user.user_metadata?.full_name?.split(' ')[0] || '',
          last_name: user.user_metadata?.last_name || user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
          email: user.email || '',
          phone: '',
          state: '',
          district: ''
        });
      }

      // Load farm data
      if (farmsData && farmsData.length > 0) {
        const farm = farmsData[0]; // Use the first farm
        setFarmData({
          name: farm.name || '',
          area_ha: farm.area_ha?.toString() || '',
          soil_type: farm.soil_type || 'loam',
          irrigation: farm.irrigation || 'drip',
          address: farm.location?.address || '',
          crops: farm.crops || []
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  // Phone number validation
  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\D/g, '')); // Remove non-digits and check
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const user = await DatabaseService.getCurrentUser();
      if (!user) {
        toast.error('Please log in to save profile');
        return;
      }

      // Validate phone number
      if (profileData.phone && !validatePhoneNumber(profileData.phone)) {
        toast.error('Please enter a valid 10-digit phone number');
        setIsSaving(false);
        return;
      }

      const savedProfile = await DatabaseService.saveUserProfile({
        user_id: user.id,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        email: profileData.email,
        phone: profileData.phone,
        state: profileData.state,
        district: profileData.district
      });

      if (savedProfile) {
        setUserProfile(savedProfile);
        toast.success('Profile saved successfully');
      } else {
        toast.error('Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveFarm = async () => {
    setIsSaving(true);
    try {
      const user = await DatabaseService.getCurrentUser();
      if (!user) {
        toast.error('Please log in to save farm details');
        return;
      }

      // Validate required fields
      if (!farmData.name.trim()) {
        toast.error('Please enter a farm name');
        setIsSaving(false);
        return;
      }

      const farmToSave = {
        user_id: user.id,
        name: farmData.name.trim(),
        area_ha: farmData.area_ha ? parseFloat(farmData.area_ha) : null,
        soil_type: farmData.soil_type,
        irrigation: farmData.irrigation,
        crops: farmData.crops,
        location: farmData.address ? {
          address: farmData.address,
          lat: 0, // Default values - could be enhanced with geocoding
          lng: 0
        } : null
      };

      // If we have existing farms, update the first one, otherwise create new
      if (farms.length > 0) {
        const updatedFarm = await DatabaseService.updateFarm(farms[0].id!, farmToSave);
        if (updatedFarm) {
          setFarms([updatedFarm, ...farms.slice(1)]);
          toast.success('Farm details updated successfully');
        } else {
          toast.error('Failed to update farm details');
        }
      } else {
        const newFarm = await DatabaseService.createFarm(farmToSave);
        if (newFarm) {
          setFarms([newFarm]);
          toast.success('Farm details saved successfully');
        } else {
          toast.error('Failed to save farm details');
        }
      }
    } catch (error) {
      console.error('Error saving farm:', error);
      toast.error('Failed to save farm details');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      const user = await DatabaseService.getCurrentUser();
      if (!user) {
        toast.error('Please log in to save settings');
        return;
      }


      const savedPrefs = await DatabaseService.saveUserPreferences({
        user_id: user.id,
        language: formData.language,
        notifications: formData.notifications
      });

      if (savedPrefs) {
        setPreferences(savedPrefs);
        toast.success('Settings saved successfully');
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Photo upload functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB');
        return;
      }

      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const user = await DatabaseService.getCurrentUser();
      if (!user) {
        toast.error('Please log in to upload photo');
        return;
      }

      // Convert file to base64 for storage
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64String = e.target?.result as string;
        
        // Update user profile with new avatar
        const updatedProfile = await DatabaseService.updateUserProfile(user.id, {
          avatar_url: base64String
        });

        if (updatedProfile) {
          setUserProfile(updatedProfile);
          setPhotoPreview(null);
          setSelectedFile(null);
          toast.success('Photo updated successfully');
        } else {
          toast.error('Failed to update photo');
        }
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      const user = await DatabaseService.getCurrentUser();
      if (!user) {
        toast.error('Please log in to remove photo');
        return;
      }

      const updatedProfile = await DatabaseService.updateUserProfile(user.id, {
        avatar_url: null
      });

      if (updatedProfile) {
        setUserProfile(updatedProfile);
        setPhotoPreview(null);
        setSelectedFile(null);
        toast.success('Photo removed successfully');
      } else {
        toast.error('Failed to remove photo');
      }
    } catch (error) {
      console.error('Error removing photo:', error);
      toast.error('Failed to remove photo');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Settings & Profile</h1>
          <p className="text-muted-foreground">
            Manage your account, farm details, and application preferences
          </p>
        </div>
      </div>


      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="farm">Farm Details</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="language">Language</TabsTrigger>
          <TabsTrigger value="data">Data & Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={photoPreview || userProfile?.avatar_url} />
                  <AvatarFallback className="text-xl">
                    {profileData.first_name?.[0]}{profileData.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label htmlFor="photo-upload">
                      <Button variant="outline" asChild>
                        <span>Change Photo</span>
                      </Button>
                    </label>
                    {selectedFile && (
                      <Button 
                        onClick={handlePhotoUpload} 
                        disabled={isUploading}
                        size="sm"
                      >
                        {isUploading ? 'Uploading...' : 'Upload'}
                      </Button>
                    )}
                    {(userProfile?.avatar_url || selectedFile) && (
                      <Button 
                        variant="destructive" 
                        onClick={handleRemovePhoto}
                        size="sm"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    value={profileData.first_name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    value={profileData.last_name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    placeholder="Enter 10-digit phone number"
                    value={profileData.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                      if (value.length <= 10) {
                        setProfileData(prev => ({ ...prev, phone: value }));
                      }
                    }}
                  />
                  {profileData.phone && !validatePhoneNumber(profileData.phone) && (
                    <p className="text-sm text-red-500">Please enter a valid 10-digit phone number</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Select 
                    value={profileData.state}
                    onValueChange={(value) => setProfileData(prev => ({ ...prev, state: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your state" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDIAN_STATES.map((state) => (
                        <SelectItem key={state.value} value={state.value}>
                          {state.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <Input 
                    id="district" 
                    value={profileData.district}
                    onChange={(e) => setProfileData(prev => ({ ...prev, district: e.target.value }))}
                    placeholder="Enter your district"
                  />
                </div>
              </div>

              <Button onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="farm" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Farm Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="farmName">Farm Name</Label>
                  <Input 
                    id="farmName" 
                    value={farmData.name}
                    onChange={(e) => setFarmData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your farm name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="farmSize">Total Farm Size (hectares)</Label>
                  <Input 
                    id="farmSize" 
                    type="number" 
                    value={farmData.area_ha}
                    onChange={(e) => setFarmData(prev => ({ ...prev, area_ha: e.target.value }))}
                    placeholder="Enter farm size in hectares"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="soilType">Primary Soil Type</Label>
                  <Select 
                    value={farmData.soil_type}
                    onValueChange={(value) => setFarmData(prev => ({ ...prev, soil_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select soil type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clay">Clay</SelectItem>
                      <SelectItem value="loam">Loam</SelectItem>
                      <SelectItem value="sandy">Sandy</SelectItem>
                      <SelectItem value="silt">Silt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="irrigation">Irrigation Method</Label>
                  <Select 
                    value={farmData.irrigation}
                    onValueChange={(value) => setFarmData(prev => ({ ...prev, irrigation: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select irrigation method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="drip">Drip Irrigation</SelectItem>
                      <SelectItem value="sprinkler">Sprinkler</SelectItem>
                      <SelectItem value="flood">Flood Irrigation</SelectItem>
                      <SelectItem value="rainfed">Rainfed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Primary Crops</Label>
                <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {CROP_OPTIONS.map((crop) => (
                      <div key={crop.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`crop-${crop.value}`}
                          checked={farmData.crops.includes(crop.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFarmData(prev => ({
                                ...prev,
                                crops: [...prev.crops, crop.value]
                              }));
                            } else {
                              setFarmData(prev => ({
                                ...prev,
                                crops: prev.crops.filter(c => c !== crop.value)
                              }));
                            }
                          }}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label
                          htmlFor={`crop-${crop.value}`}
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          {crop.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                {farmData.crops.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-muted-foreground">Selected crops:</span>
                    {farmData.crops.map((cropValue, index) => {
                      const crop = CROP_OPTIONS.find(c => c.value === cropValue);
                      return (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {crop?.label || cropValue}
                          <button
                            onClick={() => setFarmData(prev => ({
                              ...prev,
                              crops: prev.crops.filter((_, i) => i !== index)
                            }))}
                            className="ml-1 text-xs hover:text-red-500"
                          >
                            ×
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="farmAddress">Farm Address</Label>
                <Input 
                  id="farmAddress" 
                  value={farmData.address}
                  onChange={(e) => setFarmData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter your farm address"
                />
              </div>

              <Button onClick={handleSaveFarm} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Update Farm Details'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">All Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Enable or disable all notifications
                    </p>
                  </div>
                  <Switch 
                    checked={formData.notifications}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, notifications: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Weather Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified about severe weather conditions
                    </p>
                  </div>
                  <Switch checked={formData.notifications} disabled={!formData.notifications} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Market Price Updates</p>
                    <p className="text-sm text-muted-foreground">
                      Daily market price notifications for your crops
                    </p>
                  </div>
                  <Switch checked={formData.notifications} disabled={!formData.notifications} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Pest & Disease Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Early warnings about pest and disease risks
                    </p>
                  </div>
                  <Switch checked={formData.notifications} disabled={!formData.notifications} />
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Delivery Methods</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      <span>Push Notifications</span>
                    </div>
                    <Switch checked={formData.notifications} disabled={!formData.notifications} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      <span>Email Notifications</span>
                    </div>
                    <Switch checked={false} disabled={!formData.notifications} />
                  </div>
                </div>
              </div>

              <Button onClick={handleSavePreferences} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Notification Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="language" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Language & Region
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Display Language</Label>
                  <Select 
                    value={formData.language} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="ml">Malayalam</SelectItem>
                      <SelectItem value="pa">Punjabi</SelectItem>
                      <SelectItem value="gu">Gujarati</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Region/Timezone</Label>
                  <Select defaultValue="ist">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ist">India Standard Time (IST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select defaultValue="inr">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inr">Indian Rupee (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Units</Label>
                  <Select defaultValue="metric">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="metric">Metric (hectares, kg)</SelectItem>
                      <SelectItem value="imperial">Imperial (acres, lbs)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Voice Assistance</p>
                      <p className="text-sm text-muted-foreground">
                        Enable voice commands and responses
                      </p>
                    </div>
                  <Switch checked={false} />
                </div>
              </div>

              <Button onClick={handleSavePreferences} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Language Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Export Farm Data</p>
                    <p className="text-sm text-muted-foreground">
                      Download all your farm records and analytics
                    </p>
                  </div>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Data Sync</p>
                    <p className="text-sm text-muted-foreground">
                      Sync your data across devices
                    </p>
                  </div>
                  <Switch checked={true} />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Analytics Sharing</p>
                    <p className="text-sm text-muted-foreground">
                      Share anonymized data to improve AI recommendations
                    </p>
                  </div>
                  <Switch checked={true} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">
                      Add extra security to your account
                    </p>
                  </div>
                  <Button variant="outline">Enable</Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Location Sharing</p>
                    <p className="text-sm text-muted-foreground">
                      Allow location-based recommendations
                    </p>
                  </div>
                  <Switch checked={true} />
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4 text-red-700">Danger Zone</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                    <div>
                      <p className="font-medium text-red-800">Delete Account</p>
                      <p className="text-sm text-red-600">
                        Permanently delete your account and all data
                      </p>
                    </div>
                    <Button variant="destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;