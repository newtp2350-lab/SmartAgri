import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { DatabaseService, FarmHistory, Farm } from '@/services/DatabaseService';
import { Plus, Calendar, Wheat, TrendingUp, Edit, Trash2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { CROP_OPTIONS } from '@/data/crops';

interface FarmHistoryProps {
  location?: { lat: number; lng: number; address: string };
}

export const FarmHistoryComponent = ({ location }: FarmHistoryProps) => {
  const [history, setHistory] = useState<FarmHistory[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FarmHistory | null>(null);
  const [selectedFarm, setSelectedFarm] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState({
    season: '',
    crop: '',
    crops: [] as string[],
    yield_t_ha: '',
    notes: '',
    farm_id: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const user = await DatabaseService.getCurrentUser();
      if (!user) {
        toast.error('Please log in to view farm history');
        return;
      }

      const [historyData, farmsData] = await Promise.all([
        DatabaseService.getFarmHistory(user.id),
        DatabaseService.getFarms(user.id)
      ]);

      setHistory(historyData);
      setFarms(farmsData);

      // If no farms exist and we have location, create a default farm
      if (farmsData.length === 0 && location) {
        const defaultFarm = await DatabaseService.createFarm({
          user_id: user.id,
          name: `Farm at ${location.address}`,
          area_ha: undefined,
          location: location
        });
        if (defaultFarm) {
          setFarms([defaultFarm]);
          setSelectedFarm(defaultFarm.id!);
        }
      } else if (farmsData.length > 0) {
        setSelectedFarm(farmsData[0].id!);
      }
    } catch (error) {
      console.error('Error loading farm data:', error);
      toast.error('Failed to load farm history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const user = await DatabaseService.getCurrentUser();
      if (!user) {
        toast.error('Please log in to save farm history');
        return;
      }

      const historyData: Omit<FarmHistory, 'id' | 'recorded_at'> = {
        user_id: user.id,
        farm_id: formData.farm_id || undefined,
        season: formData.season,
        crop: formData.crops.length > 0 ? formData.crops.join(', ') : formData.crop,
        yield_t_ha: formData.yield_t_ha ? parseFloat(formData.yield_t_ha) : undefined,
        notes: formData.notes
      };

      const savedRecord = await DatabaseService.saveFarmHistory(historyData);
      if (savedRecord) {
        setHistory(prev => [savedRecord, ...prev]);
        toast.success('Farm record saved successfully');
        resetForm();
        setIsDialogOpen(false);
      } else {
        toast.error('Failed to save farm record');
      }
    } catch (error) {
      console.error('Error saving farm history:', error);
      toast.error('Failed to save farm record');
    }
  };

  const resetForm = () => {
    setFormData({
      season: '',
      crop: '',
      crops: [],
      yield_t_ha: '',
      notes: '',
      farm_id: selectedFarm
    });
    setEditingRecord(null);
  };

  const handleEdit = (record: FarmHistory) => {
    setEditingRecord(record);
    // Parse crops from the crop string (comma-separated)
    const crops = record.crop ? record.crop.split(',').map(c => c.trim()) : [];
    setFormData({
      season: record.season,
      crop: record.crop,
      crops: crops,
      yield_t_ha: record.yield_t_ha?.toString() || '',
      notes: record.notes || '',
      farm_id: record.farm_id || selectedFarm
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!editingRecord?.id) return;
    
    try {
      const success = await DatabaseService.deleteFarmHistory(editingRecord.id);
      if (success) {
        setHistory(prev => prev.filter(record => record.id !== editingRecord.id));
        toast.success('Farm record deleted successfully');
        setIsDialogOpen(false);
        setEditingRecord(null);
      } else {
        toast.error('Failed to delete farm record');
      }
    } catch (error) {
      console.error('Error deleting farm record:', error);
      toast.error('Failed to delete farm record');
    }
  };

  const getSeasonColor = (season: string) => {
    const seasonLower = season.toLowerCase();
    if (seasonLower.includes('kharif')) return 'bg-green-100 text-green-800';
    if (seasonLower.includes('rabi')) return 'bg-blue-100 text-blue-800';
    if (seasonLower.includes('zaid')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading farm history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                {editingRecord ? 'Edit Farm Record' : 'Add New Farm Record'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="farm">Farm</Label>
                    <Select value={formData.farm_id} onValueChange={(value) => setFormData(prev => ({ ...prev, farm_id: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select farm" />
                      </SelectTrigger>
                      <SelectContent>
                        {farms.map((farm) => (
                          <SelectItem key={farm.id} value={farm.id!}>
                            {farm.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="season">Season</Label>
                    <Select value={formData.season} onValueChange={(value) => setFormData(prev => ({ ...prev, season: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select season" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Kharif">Kharif (Monsoon)</SelectItem>
                        <SelectItem value="Rabi">Rabi (Winter)</SelectItem>
                        <SelectItem value="Zaid">Zaid (Summer)</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="yield">Yield (tonnes/hectare)</Label>
                    <Input
                      id="yield"
                      type="number"
                      step="0.1"
                      value={formData.yield_t_ha}
                      onChange={(e) => setFormData(prev => ({ ...prev, yield_t_ha: e.target.value }))}
                      placeholder="e.g., 3.5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes about this crop season..."
                      rows={4}
                    />
                  </div>
                </div>

                {/* Right Column - Crops Selection */}
                <div className="space-y-4">
                  <div className="space-y-4">
                    <Label>Primary Crops</Label>
                    <div className="border rounded-lg p-4 max-h-80 overflow-y-auto">
                      <div className="grid grid-cols-2 gap-2">
                        {CROP_OPTIONS.map((crop) => (
                          <div key={crop.value} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`crop-${crop.value}`}
                              checked={formData.crops.includes(crop.value)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData(prev => ({
                                    ...prev,
                                    crops: [...prev.crops, crop.value]
                                  }));
                                } else {
                                  setFormData(prev => ({
                                    ...prev,
                                    crops: prev.crops.filter(c => c !== crop.value)
                                  }));
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                            <label htmlFor={`crop-${crop.value}`} className="text-sm">
                              {crop.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    {formData.crops.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-sm text-muted-foreground">Selected crops:</span>
                        <div className="flex flex-wrap gap-2">
                          {formData.crops.map((cropValue, index) => {
                            const crop = CROP_OPTIONS.find(c => c.value === cropValue);
                            return (
                              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                {crop?.label || cropValue}
                                <button
                                  onClick={() => setFormData(prev => ({
                                    ...prev,
                                    crops: prev.crops.filter(c => c !== cropValue)
                                  }))}
                                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                                >
                                  ×
                                </button>
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingRecord ? 'Update Record' : 'Save Record'}
                </Button>
                {editingRecord && (
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={handleDelete}
                    className="px-4"
                  >
                    Delete
                  </Button>
                )}
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {history.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wheat className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Farm History Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start tracking your crop yields and farming activities to build your farm history.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Record
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {history.map((record) => (
            <Card key={record.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{record.crop}</h3>
                      <Badge className={getSeasonColor(record.season)}>
                        {record.season}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(record.recorded_at || new Date().toISOString())}</span>
                      </div>
                      
                      {record.yield_t_ha && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          <span>{record.yield_t_ha} t/ha</span>
                        </div>
                      )}
                      
                      {record.farm_id && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{farms.find(f => f.id === record.farm_id)?.name || 'Unknown Farm'}</span>
                        </div>
                      )}
                    </div>
                    
                    {record.notes && (
                      <p className="text-sm text-muted-foreground">{record.notes}</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(record)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FarmHistoryComponent;

