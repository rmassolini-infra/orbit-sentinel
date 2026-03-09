export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          chm_value: number | null
          created_at: string
          id: string
          is_acknowledged: boolean | null
          message: string
          segment_id: string | null
          severity: string
          ttc_value: number | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          chm_value?: number | null
          created_at?: string
          id?: string
          is_acknowledged?: boolean | null
          message: string
          segment_id?: string | null
          severity: string
          ttc_value?: number | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          chm_value?: number | null
          created_at?: string
          id?: string
          is_acknowledged?: boolean | null
          message?: string
          segment_id?: string | null
          severity?: string
          ttc_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "segments"
            referencedColumns: ["id"]
          },
        ]
      }
      api_cache: {
        Row: {
          cache_key: string
          created_at: string
          expires_at: string
          id: string
          response_data: Json
        }
        Insert: {
          cache_key: string
          created_at?: string
          expires_at: string
          id?: string
          response_data: Json
        }
        Update: {
          cache_key?: string
          created_at?: string
          expires_at?: string
          id?: string
          response_data?: Json
        }
        Relationships: []
      }
      chm_history: {
        Row: {
          chm_value: number
          confidence: number | null
          created_at: string
          id: string
          measurement_date: string
          segment_id: string | null
          source: string | null
        }
        Insert: {
          chm_value: number
          confidence?: number | null
          created_at?: string
          id?: string
          measurement_date: string
          segment_id?: string | null
          source?: string | null
        }
        Update: {
          chm_value?: number
          confidence?: number | null
          created_at?: string
          id?: string
          measurement_date?: string
          segment_id?: string | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chm_history_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "segments"
            referencedColumns: ["id"]
          },
        ]
      }
      corridors: {
        Row: {
          created_at: string
          end_location: string
          id: string
          name: string
          reference_system: string | null
          start_location: string
          total_km: number
          updated_at: string
          utm_zone: string | null
        }
        Insert: {
          created_at?: string
          end_location: string
          id?: string
          name: string
          reference_system?: string | null
          start_location: string
          total_km: number
          updated_at?: string
          utm_zone?: string | null
        }
        Update: {
          created_at?: string
          end_location?: string
          id?: string
          name?: string
          reference_system?: string | null
          start_location?: string
          total_km?: number
          updated_at?: string
          utm_zone?: string | null
        }
        Relationships: []
      }
      insar_metrics: {
        Row: {
          baseline_perpendicular: number | null
          baseline_temporal: number | null
          bias: number | null
          chm_derived: number | null
          coherence_mean: number | null
          coherence_std: number | null
          created_at: string
          id: string
          mae: number | null
          metadata: Json | null
          pair_date_1: string
          pair_date_2: string
          phase_residual_std: number | null
          processing_date: string
          rmse: number | null
          segment_id: string | null
          unwrapping_quality: string | null
        }
        Insert: {
          baseline_perpendicular?: number | null
          baseline_temporal?: number | null
          bias?: number | null
          chm_derived?: number | null
          coherence_mean?: number | null
          coherence_std?: number | null
          created_at?: string
          id?: string
          mae?: number | null
          metadata?: Json | null
          pair_date_1: string
          pair_date_2: string
          phase_residual_std?: number | null
          processing_date: string
          rmse?: number | null
          segment_id?: string | null
          unwrapping_quality?: string | null
        }
        Update: {
          baseline_perpendicular?: number | null
          baseline_temporal?: number | null
          bias?: number | null
          chm_derived?: number | null
          coherence_mean?: number | null
          coherence_std?: number | null
          created_at?: string
          id?: string
          mae?: number | null
          metadata?: Json | null
          pair_date_1?: string
          pair_date_2?: string
          phase_residual_std?: number | null
          processing_date?: string
          rmse?: number | null
          segment_id?: string | null
          unwrapping_quality?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "insar_metrics_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "segments"
            referencedColumns: ["id"]
          },
        ]
      }
      richards_params: {
        Row: {
          fit_end_date: string | null
          fit_start_date: string | null
          h0_initial: number
          ic_lower_days: number | null
          ic_upper_days: number | null
          id: string
          k_asymptote: number
          m_shape: number
          n_observations: number | null
          r_growth_rate: number
          r_squared: number | null
          segment_id: string | null
          ttc_projection_days: number | null
          updated_at: string
        }
        Insert: {
          fit_end_date?: string | null
          fit_start_date?: string | null
          h0_initial: number
          ic_lower_days?: number | null
          ic_upper_days?: number | null
          id?: string
          k_asymptote: number
          m_shape: number
          n_observations?: number | null
          r_growth_rate: number
          r_squared?: number | null
          segment_id?: string | null
          ttc_projection_days?: number | null
          updated_at?: string
        }
        Update: {
          fit_end_date?: string | null
          fit_start_date?: string | null
          h0_initial?: number
          ic_lower_days?: number | null
          ic_upper_days?: number | null
          id?: string
          k_asymptote?: number
          m_shape?: number
          n_observations?: number | null
          r_growth_rate?: number
          r_squared?: number | null
          segment_id?: string | null
          ttc_projection_days?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "richards_params_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: true
            referencedRelation: "segments"
            referencedColumns: ["id"]
          },
        ]
      }
      satellite_images: {
        Row: {
          acquisition_date: string
          bounds: unknown
          cloud_coverage_pct: number | null
          corridor_id: string | null
          created_at: string
          id: string
          image_type: string
          metadata: Json | null
          source: string
          tile_url: string | null
        }
        Insert: {
          acquisition_date: string
          bounds?: unknown
          cloud_coverage_pct?: number | null
          corridor_id?: string | null
          created_at?: string
          id?: string
          image_type: string
          metadata?: Json | null
          source: string
          tile_url?: string | null
        }
        Update: {
          acquisition_date?: string
          bounds?: unknown
          cloud_coverage_pct?: number | null
          corridor_id?: string | null
          created_at?: string
          id?: string
          image_type?: string
          metadata?: Json | null
          source?: string
          tile_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "satellite_images_corridor_id_fkey"
            columns: ["corridor_id"]
            isOneToOne: false
            referencedRelation: "corridors"
            referencedColumns: ["id"]
          },
        ]
      }
      segments: {
        Row: {
          chm_current: number | null
          corridor_id: string | null
          created_at: string
          dms: number | null
          dominant_species: string | null
          geometry: unknown
          growth_rate: number | null
          id: string
          km_end: number
          km_start: number
          last_inspection_at: string | null
          risk_level: string | null
          ttc_days: number | null
          updated_at: string
        }
        Insert: {
          chm_current?: number | null
          corridor_id?: string | null
          created_at?: string
          dms?: number | null
          dominant_species?: string | null
          geometry?: unknown
          growth_rate?: number | null
          id?: string
          km_end: number
          km_start: number
          last_inspection_at?: string | null
          risk_level?: string | null
          ttc_days?: number | null
          updated_at?: string
        }
        Update: {
          chm_current?: number | null
          corridor_id?: string | null
          created_at?: string
          dms?: number | null
          dominant_species?: string | null
          geometry?: unknown
          growth_rate?: number | null
          id?: string
          km_end?: number
          km_start?: number
          last_inspection_at?: string | null
          risk_level?: string | null
          ttc_days?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "segments_corridor_id_fkey"
            columns: ["corridor_id"]
            isOneToOne: false
            referencedRelation: "corridors"
            referencedColumns: ["id"]
          },
        ]
      }
      service_orders: {
        Row: {
          code: string
          completed_at: string | null
          completion_notes: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          priority: string
          scheduled_date: string | null
          segment_id: string | null
          status: string
          team_assigned: string | null
          updated_at: string
        }
        Insert: {
          code: string
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          priority?: string
          scheduled_date?: string | null
          segment_id?: string | null
          status?: string
          team_assigned?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          priority?: string
          scheduled_date?: string | null
          segment_id?: string | null
          status?: string
          team_assigned?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_orders_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "segments"
            referencedColumns: ["id"]
          },
        ]
      }
      vegetation_species: {
        Row: {
          average_growth_rate: number | null
          color_hex: string | null
          common_name: string | null
          created_at: string
          growth_class: string | null
          id: string
          max_height: number | null
          risk_category: string | null
          scientific_name: string
        }
        Insert: {
          average_growth_rate?: number | null
          color_hex?: string | null
          common_name?: string | null
          created_at?: string
          growth_class?: string | null
          id?: string
          max_height?: number | null
          risk_category?: string | null
          scientific_name: string
        }
        Update: {
          average_growth_rate?: number | null
          color_hex?: string | null
          common_name?: string | null
          created_at?: string
          growth_class?: string | null
          id?: string
          max_height?: number | null
          risk_category?: string | null
          scientific_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_ttc: {
        Args: { p_chm_current: number; p_dms: number; p_growth_rate: number }
        Returns: number
      }
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
