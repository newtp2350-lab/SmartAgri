import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatabaseService, Alert as AlertType, Farm } from '@/services/DatabaseService';
import { 
  Bell, 
  AlertTriangle, 
  TrendingUp, 
  Bug, 
  CheckCircle, 
  Clock, 
  MapPin,
  RefreshCw,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';

interface AlertsComponentProps {
  location?: { lat: number; lng: number; address: string };
}

export interface AlertsComponentRef {
  refreshAlerts: () => void;
}

export const AlertsComponent = forwardRef<AlertsComponentRef, AlertsComponentProps>(({ location }, ref) => {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'weather' | 'market' | 'pest'>('all');

  useEffect(() => {
    loadAlerts();
  }, []);

  useImperativeHandle(ref, () => ({
    refreshAlerts: loadAlerts
  }));

  const loadAlerts = async () => {
    setIsLoading(true);
    try {
      const user = await DatabaseService.getCurrentUser();
      if (!user) {
        toast.error('Please log in to view alerts');
        return;
      }

      const [alertsData, farmsData] = await Promise.all([
        DatabaseService.getAlerts(user.id),
        DatabaseService.getFarms(user.id)
      ]);

      setAlerts(alertsData);
      setFarms(farmsData);

      // If no alerts exist, create some sample alerts for demonstration
      if (alertsData.length === 0 && farmsData.length > 0) {
        const sampleAlerts = [
          {
            user_id: user.id,
            farm_id: farmsData[0].id,
            type: 'weather' as const,
            title: 'Heavy Rain Alert',
            message: 'Heavy rainfall expected in your area over the next 24 hours. Consider covering sensitive crops.',
            read: false
          },
          {
            user_id: user.id,
            farm_id: farmsData[0].id,
            type: 'market' as const,
            title: 'Price Increase Alert',
            message: 'Wheat prices have increased by 15% in your local market. Consider selling your harvest.',
            read: false
          },
          {
            user_id: user.id,
            farm_id: farmsData[0].id,
            type: 'pest' as const,
            title: 'Pest Detection Alert',
            message: 'Aphid infestation detected in nearby farms. Monitor your crops closely and consider preventive measures.',
            read: true
          }
        ];

        // Create sample alerts
        for (const alert of sampleAlerts) {
          const createdAlert = await DatabaseService.createAlert(alert);
          if (createdAlert) {
            setAlerts(prev => [...prev, createdAlert]);
          }
        }
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
      toast.error('Failed to load alerts');
    } finally {
      setIsLoading(false);
    }
  };


  const markAsRead = async (alertId: string) => {
    try {
      const success = await DatabaseService.markAlertAsRead(alertId);
      if (success) {
        setAlerts(prev => 
          prev.map(alert => 
            alert.id === alertId ? { ...alert, read: true } : alert
          )
        );
        toast.success('Alert marked as read');
      }
    } catch (error) {
      console.error('Error marking alert as read:', error);
      toast.error('Failed to mark alert as read');
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'weather':
        return <AlertTriangle className="w-5 h-5 text-blue-500" />;
      case 'market':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'pest':
        return <Bug className="w-5 h-5 text-red-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'weather':
        return 'border-blue-200 bg-blue-50';
      case 'market':
        return 'border-green-200 bg-green-50';
      case 'pest':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'weather':
        return 'bg-blue-100 text-blue-800';
      case 'market':
        return 'bg-green-100 text-green-800';
      case 'pest':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !alert.read;
    return alert.type === filter;
  });

  const unreadCount = alerts.filter(alert => !alert.read).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Alerts</p>
                <p className="text-2xl font-bold">{alerts.length}</p>
              </div>
              <Bell className="w-8 h-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold text-primary">{unreadCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Weather</p>
                <p className="text-2xl font-bold text-blue-600">
                  {alerts.filter(a => a.type === 'weather').length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Market</p>
                <p className="text-2xl font-bold text-green-600">
                  {alerts.filter(a => a.type === 'market').length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({alerts.length})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
          <TabsTrigger value="weather">Weather ({alerts.filter(a => a.type === 'weather').length})</TabsTrigger>
          <TabsTrigger value="market">Market ({alerts.filter(a => a.type === 'market').length})</TabsTrigger>
          <TabsTrigger value="pest">Pest ({alerts.filter(a => a.type === 'pest').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Alerts Found</h3>
                <p className="text-muted-foreground text-center">
                  {filter === 'unread' 
                    ? 'You have no unread alerts.' 
                    : `No ${filter} alerts available.`}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredAlerts.map((alert) => (
                <Card 
                  key={alert.id} 
                  className={`transition-all hover:shadow-md ${
                    !alert.read ? 'ring-2 ring-primary/20' : ''
                  } ${getAlertColor(alert.type)}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex-shrink-0 mt-1">
                          {getAlertIcon(alert.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{alert.title}</h3>
                            <Badge className={getTypeBadgeColor(alert.type)}>
                              {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
                            </Badge>
                            {!alert.read && (
                              <Badge variant="secondary" className="bg-primary text-primary-foreground">
                                New
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-muted-foreground mb-3">{alert.message}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{formatDate(alert.created_at || new Date().toISOString())}</span>
                            </div>
                            
                            {alert.farm_id && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{farms.find(f => f.id === alert.farm_id)?.name || 'Unknown Farm'}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {!alert.read && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markAsRead(alert.id!)}
                          className="ml-4"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark as Read
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
});

AlertsComponent.displayName = 'AlertsComponent';

export default AlertsComponent;

