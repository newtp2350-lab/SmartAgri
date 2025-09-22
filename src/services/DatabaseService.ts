import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  id?: string;
  user_id?: string;
  query: string;
  response: string;
  timestamp?: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
}

export interface FarmHistory {
  id?: string;
  user_id?: string;
  farm_id?: string;
  season: string;
  crop: string;
  yield_t_ha?: number;
  notes?: string;
  recorded_at?: string;
}

export interface Alert {
  id?: string;
  user_id?: string;
  farm_id?: string;
  type: 'weather' | 'market' | 'pest';
  title: string;
  message: string;
  read: boolean;
  created_at?: string;
}

export interface Farm {
  id?: string;
  user_id?: string;
  name: string;
  area_ha?: number;
  soil_type?: string;
  irrigation?: string;
  crops?: string[];
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  created_at?: string;
}

export interface UserPreferences {
  id?: string;
  user_id?: string;
  language: string;
  notifications: boolean;
  created_at?: string;
}

export interface UserProfile {
  id?: string;
  user_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  state?: string;
  district?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export class DatabaseService {
  // Chat History Methods
  static async saveChatMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage | null> {
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .insert([{
          user_id: message.user_id,
          query: message.query,
          response: message.response,
          location: message.location
        }])
        .select()
        .single();

      if (error) {
        console.error('Error saving chat message:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error saving chat message:', error);
      return null;
    }
  }

  static async getChatHistory(userId: string, limit: number = 50): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching chat history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return [];
    }
  }

  // Farm History Methods
  static async saveFarmHistory(history: Omit<FarmHistory, 'id' | 'recorded_at'>): Promise<FarmHistory | null> {
    try {
      const { data, error } = await supabase
        .from('history')
        .insert([{
          user_id: history.user_id,
          farm_id: history.farm_id,
          season: history.season,
          crop: history.crop,
          yield_t_ha: history.yield_t_ha,
          notes: history.notes
        }])
        .select()
        .single();

      if (error) {
        console.error('Error saving farm history:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error saving farm history:', error);
      return null;
    }
  }

  static async deleteFarmHistory(historyId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('history')
        .delete()
        .eq('id', historyId);

      if (error) {
        console.error('Error deleting farm history:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting farm history:', error);
      return false;
    }
  }

  static async getFarmHistory(userId: string, farmId?: string): Promise<FarmHistory[]> {
    try {
      let query = supabase
        .from('history')
        .select('*')
        .eq('user_id', userId)
        .order('recorded_at', { ascending: false });

      if (farmId) {
        query = query.eq('farm_id', farmId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching farm history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching farm history:', error);
      return [];
    }
  }

  // Farm Management Methods
  static async createFarm(farm: Omit<Farm, 'id' | 'created_at'>): Promise<Farm | null> {
    try {
      const { data, error } = await supabase
        .from('farms')
        .insert([{
          user_id: farm.user_id,
          name: farm.name,
          area_ha: farm.area_ha,
          soil_type: farm.soil_type,
          irrigation: farm.irrigation,
          crops: farm.crops,
          location: farm.location
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating farm:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating farm:', error);
      return null;
    }
  }

  static async updateFarm(farmId: string, farm: Omit<Farm, 'id' | 'created_at' | 'user_id'>): Promise<Farm | null> {
    try {
      const { data, error } = await supabase
        .from('farms')
        .update({
          name: farm.name,
          area_ha: farm.area_ha,
          soil_type: farm.soil_type,
          irrigation: farm.irrigation,
          crops: farm.crops,
          location: farm.location
        })
        .eq('id', farmId)
        .select()
        .single();

      if (error) {
        console.error('Error updating farm:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating farm:', error);
      return null;
    }
  }

  static async getFarms(userId: string): Promise<Farm[]> {
    try {
      const { data, error } = await supabase
        .from('farms')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching farms:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching farms:', error);
      return [];
    }
  }

  // Alerts Methods
  static async createAlert(alert: Omit<Alert, 'id' | 'created_at'>): Promise<Alert | null> {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .insert([{
          user_id: alert.user_id,
          farm_id: alert.farm_id,
          type: alert.type,
          title: alert.title,
          message: alert.message,
          read: alert.read
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating alert:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating alert:', error);
      return null;
    }
  }

  static async getAlerts(userId: string, unreadOnly: boolean = false): Promise<Alert[]> {
    try {
      let query = supabase
        .from('alerts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (unreadOnly) {
        query = query.eq('read', false);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching alerts:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching alerts:', error);
      return [];
    }
  }

  static async markAlertAsRead(alertId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ read: true })
        .eq('id', alertId);

      if (error) {
        console.error('Error marking alert as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error marking alert as read:', error);
      return false;
    }
  }

  // User Preferences Methods
  static async saveUserPreferences(preferences: Omit<UserPreferences, 'id' | 'created_at'>): Promise<UserPreferences | null> {
    try {
      // First try to update existing preferences
      const { data: existingPrefs } = await supabase
        .from('preferences')
        .select('*')
        .eq('user_id', preferences.user_id)
        .single();

      if (existingPrefs) {
        // Update existing preferences
        const { data, error } = await supabase
          .from('preferences')
          .update({
            language: preferences.language,
            notifications: preferences.notifications
          })
          .eq('user_id', preferences.user_id)
          .select()
          .single();

        if (error) {
          console.error('Error updating user preferences:', error);
          return null;
        }

        return data;
      } else {
        // Insert new preferences
        const { data, error } = await supabase
          .from('preferences')
          .insert([{
            user_id: preferences.user_id,
            language: preferences.language,
            notifications: preferences.notifications
          }])
          .select()
          .single();

        if (error) {
          console.error('Error creating user preferences:', error);
          return null;
        }

        return data;
      }
    } catch (error) {
      console.error('Error saving user preferences:', error);
      return null;
    }
  }

  static async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user preferences:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return null;
    }
  }

  // User Profile Methods
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  static async updateUserProfile(userId: string, updates: Partial<Omit<UserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
  }

  static async saveUserProfile(profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<UserProfile | null> {
    try {
      // First try to update existing profile
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', profile.user_id)
        .single();

      if (existingProfile) {
        // Update existing profile
        const { data, error } = await supabase
          .from('user_profiles')
          .update({
            first_name: profile.first_name,
            last_name: profile.last_name,
            email: profile.email,
            phone: profile.phone,
            state: profile.state,
            district: profile.district,
            avatar_url: profile.avatar_url,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', profile.user_id)
          .select()
          .single();

        if (error) {
          console.error('Error updating user profile:', error);
          return null;
        }

        return data;
      } else {
        // Insert new profile
        const { data, error } = await supabase
          .from('user_profiles')
          .insert([{
            user_id: profile.user_id,
            first_name: profile.first_name,
            last_name: profile.last_name,
            email: profile.email,
            phone: profile.phone,
            state: profile.state,
            district: profile.district,
            avatar_url: profile.avatar_url
          }])
          .select()
          .single();

        if (error) {
          console.error('Error creating user profile:', error);
          return null;
        }

        return data;
      }
    } catch (error) {
      console.error('Error saving user profile:', error);
      return null;
    }
  }

  // Utility Methods
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error getting current user:', error);
        return null;
      }
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  static async isUserAuthenticated(): Promise<boolean> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error checking authentication:', error);
        return false;
      }
      return !!session;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }
}

export default DatabaseService;
