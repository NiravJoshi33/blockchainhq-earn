export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      applications: {
        Row: {
          additional_info: Json | null;
          cover_letter: string | null;
          created_at: string | null;
          id: string;
          opportunity_id: string;
          portfolio_link: string | null;
          status: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          additional_info?: Json | null;
          cover_letter?: string | null;
          created_at?: string | null;
          id?: string;
          opportunity_id: string;
          portfolio_link?: string | null;
          status?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          additional_info?: Json | null;
          cover_letter?: string | null;
          created_at?: string | null;
          id?: string;
          opportunity_id?: string;
          portfolio_link?: string | null;
          status?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "applications_opportunity_id_fkey";
            columns: ["opportunity_id"];
            isOneToOne: false;
            referencedRelation: "opportunities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "applications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      opportunities: {
        Row: {
          amount: number;
          applicants_count: number | null;
          benefits: string[] | null;
          category: string | null;
          contact_email: string | null;
          created_at: string | null;
          currency: string | null;
          deadline: string;
          description: string;
          difficulty_level: string | null;
          duration: string | null;
          eligibility_criteria: string[] | null;
          end_date: string | null;
          expected_outcomes: string[] | null;
          funding_max: number | null;
          funding_min: number | null;
          id: string;
          is_open_source: boolean | null;
          is_recurring: boolean | null;
          job_type: string | null;
          location: string | null;
          max_submissions: number | null;
          max_team_size: number | null;
          organization: string;
          organization_logo: string | null;
          repository_url: string | null;
          required_skills: string[] | null;
          requirements: string[] | null;
          responsibilities: string[] | null;
          salary_max: number | null;
          salary_min: number | null;
          sponsor_id: string | null;
          start_date: string | null;
          status: string | null;
          submission_url: string | null;
          tags: string[] | null;
          team_size: number | null;
          title: string;
          tracks: string[] | null;
          type: string;
          updated_at: string | null;
          verification_required: boolean | null;
          detailed_description: string | null;
          requirements_list: string[] | null;
          submission_guidelines: string | null;
          about_organization: string | null;
        };
        Insert: {
          amount: number;
          applicants_count?: number | null;
          benefits?: string[] | null;
          category?: string | null;
          contact_email?: string | null;
          created_at?: string | null;
          currency?: string | null;
          deadline: string;
          description: string;
          difficulty_level?: string | null;
          duration?: string | null;
          eligibility_criteria?: string[] | null;
          end_date?: string | null;
          expected_outcomes?: string[] | null;
          funding_max?: number | null;
          funding_min?: number | null;
          id?: string;
          is_open_source?: boolean | null;
          is_recurring?: boolean | null;
          job_type?: string | null;
          location?: string | null;
          max_submissions?: number | null;
          max_team_size?: number | null;
          organization: string;
          organization_logo?: string | null;
          repository_url?: string | null;
          required_skills?: string[] | null;
          requirements?: string[] | null;
          responsibilities?: string[] | null;
          salary_max?: number | null;
          salary_min?: number | null;
          sponsor_id?: string | null;
          start_date?: string | null;
          status?: string | null;
          submission_url?: string | null;
          tags?: string[] | null;
          team_size?: number | null;
          title: string;
          tracks?: string[] | null;
          type: string;
          updated_at?: string | null;
          verification_required?: boolean | null;
          detailed_description?: string | null;
          requirements_list?: string[] | null;
          submission_guidelines?: string | null;
          about_organization?: string | null;
        };
        Update: {
          amount?: number;
          applicants_count?: number | null;
          benefits?: string[] | null;
          category?: string | null;
          contact_email?: string | null;
          created_at?: string | null;
          currency?: string | null;
          deadline?: string;
          description?: string;
          difficulty_level?: string | null;
          duration?: string | null;
          eligibility_criteria?: string[] | null;
          end_date?: string | null;
          expected_outcomes?: string[] | null;
          funding_max?: number | null;
          funding_min?: number | null;
          id?: string;
          is_open_source?: boolean | null;
          is_recurring?: boolean | null;
          job_type?: string | null;
          location?: string | null;
          max_submissions?: number | null;
          max_team_size?: number | null;
          organization?: string;
          organization_logo?: string | null;
          repository_url?: string | null;
          required_skills?: string[] | null;
          requirements?: string[] | null;
          responsibilities?: string[] | null;
          salary_max?: number | null;
          salary_min?: number | null;
          sponsor_id?: string | null;
          start_date?: string | null;
          status?: string | null;
          submission_url?: string | null;
          tags?: string[] | null;
          team_size?: number | null;
          title?: string;
          tracks?: string[] | null;
          type?: string;
          updated_at?: string | null;
          verification_required?: boolean | null;
          detailed_description?: string | null;
          requirements_list?: string[] | null;
          submission_guidelines?: string | null;
          about_organization?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "opportunities_sponsor_id_fkey";
            columns: ["sponsor_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      saved_opportunities: {
        Row: {
          created_at: string | null;
          id: string;
          opportunity_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          opportunity_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          opportunity_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "saved_opportunities_opportunity_id_fkey";
            columns: ["opportunity_id"];
            isOneToOne: false;
            referencedRelation: "opportunities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "saved_opportunities_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      users: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          created_at: string | null;
          email: string | null;
          github_url: string | null;
          id: string;
          name: string | null;
          portfolio_url: string | null;
          privy_id: string;
          role: string | null;
          skills: string[] | null;
          twitter_url: string | null;
          updated_at: string | null;
          wallet_address: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string | null;
          email?: string | null;
          github_url?: string | null;
          id?: string;
          name?: string | null;
          portfolio_url?: string | null;
          privy_id: string;
          role?: string | null;
          skills?: string[] | null;
          twitter_url?: string | null;
          updated_at?: string | null;
          wallet_address?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string | null;
          email?: string | null;
          github_url?: string | null;
          id?: string;
          name?: string | null;
          portfolio_url?: string | null;
          privy_id?: string;
          role?: string | null;
          skills?: string[] | null;
          twitter_url?: string | null;
          updated_at?: string | null;
          wallet_address?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
