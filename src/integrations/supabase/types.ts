export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      users: {
        Row: {
          user_id: number
          name: string | null
          phone_number: string | null
          email: string | null
          preferred_language: string | null
          location_lat: number | null
          location_lon: number | null
          created_at: string | null
        }
        Insert: {
          user_id?: number
          name?: string | null
          phone_number?: string | null
          email?: string | null
          preferred_language?: string | null
          location_lat?: number | null
          location_lon?: number | null
          created_at?: string | null
        }
        Update: {
          user_id?: number
          name?: string | null
          phone_number?: string | null
          email?: string | null
          preferred_language?: string | null
          location_lat?: number | null
          location_lon?: number | null
          created_at?: string | null
        }
      }
      locations: {
        Row: {
          location_id: number
          state: string | null
          district: string | null
          city_or_market: string | null
          latitude: number | null
          longitude: number | null
        }
        Insert: {
          location_id?: number
          state?: string | null
          district?: string | null
          city_or_market?: string | null
          latitude?: number | null
          longitude?: number | null
        }
        Update: {
          location_id?: number
          state?: string | null
          district?: string | null
          city_or_market?: string | null
          latitude?: number | null
          longitude?: number | null
        }
      }
      crops: {
        Row: {
          crop_id: number
          crop_name: string
          ideal_ph_min: number | null
          ideal_ph_max: number | null
          ideal_rainfall_min: number | null
          ideal_rainfall_max: number | null
          ideal_temp_min: number | null
          ideal_temp_max: number | null
          soil_type_suitability: string | null
        }
        Insert: {
          crop_id?: number
          crop_name: string
          ideal_ph_min?: number | null
          ideal_ph_max?: number | null
          ideal_rainfall_min?: number | null
          ideal_rainfall_max?: number | null
          ideal_temp_min?: number | null
          ideal_temp_max?: number | null
          soil_type_suitability?: string | null
        }
        Update: {
          crop_id?: number
          crop_name?: string
          ideal_ph_min?: number | null
          ideal_ph_max?: number | null
          ideal_rainfall_min?: number | null
          ideal_rainfall_max?: number | null
          ideal_temp_min?: number | null
          ideal_temp_max?: number | null
          soil_type_suitability?: string | null
        }
      }
      soil_data: {
        Row: {
          soil_id: number
          location_id: number | null
          ph: number | null
          organic_carbon: number | null
          sand_percent: number | null
          clay_percent: number | null
          silt_percent: number | null
          last_updated: string | null
        }
        Insert: {
          soil_id?: number
          location_id?: number | null
          ph?: number | null
          organic_carbon?: number | null
          sand_percent?: number | null
          clay_percent?: number | null
          silt_percent?: number | null
          last_updated?: string | null
        }
        Update: {
          soil_id?: number
          location_id?: number | null
          ph?: number | null
          organic_carbon?: number | null
          sand_percent?: number | null
          clay_percent?: number | null
          silt_percent?: number | null
          last_updated?: string | null
        }
      }
      weather_data: {
        Row: {
          weather_id: number
          location_id: number | null
          temperature: number | null
          rainfall: number | null
          humidity: number | null
          forecast_json: Json | null
          last_updated: string | null
        }
        Insert: {
          weather_id?: number
          location_id?: number | null
          temperature?: number | null
          rainfall?: number | null
          humidity?: number | null
          forecast_json?: Json | null
          last_updated?: string | null
        }
        Update: {
          weather_id?: number
          location_id?: number | null
          temperature?: number | null
          rainfall?: number | null
          humidity?: number | null
          forecast_json?: Json | null
          last_updated?: string | null
        }
      }
      market_prices: {
        Row: {
          market_price_id: number
          crop_id: number | null
          location_id: number | null
          price: number | null
          price_range_min: number | null
          price_range_max: number | null
          volume: number | null
          last_updated: string | null
        }
        Insert: {
          market_price_id?: number
          crop_id?: number | null
          location_id?: number | null
          price?: number | null
          price_range_min?: number | null
          price_range_max?: number | null
          volume?: number | null
          last_updated?: string | null
        }
        Update: {
          market_price_id?: number
          crop_id?: number | null
          location_id?: number | null
          price?: number | null
          price_range_min?: number | null
          price_range_max?: number | null
          volume?: number | null
          last_updated?: string | null
        }
      }
      suitability_scores: {
        Row: {
          score_id: number
          user_id: number | null
          crop_id: number | null
          location_id: number | null
          suitability_score: number | null
          recommendation_reason: string | null
          generated_at: string | null
        }
        Insert: {
          score_id?: number
          user_id?: number | null
          crop_id?: number | null
          location_id?: number | null
          suitability_score?: number | null
          recommendation_reason?: string | null
          generated_at?: string | null
        }
        Update: {
          score_id?: number
          user_id?: number | null
          crop_id?: number | null
          location_id?: number | null
          suitability_score?: number | null
          recommendation_reason?: string | null
          generated_at?: string | null
        }
      }
      chat_history: {
        Row: {
          chat_id: number
          user_id: number | null
          query: string
          response: string
          timestamp: string | null
        }
        Insert: {
          chat_id?: number
          user_id?: number | null
          query: string
          response: string
          timestamp?: string | null
        }
        Update: {
          chat_id?: number
          user_id?: number | null
          query?: string
          response?: string
          timestamp?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
