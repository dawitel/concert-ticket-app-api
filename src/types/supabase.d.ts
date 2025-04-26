export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      special_vip_tickets: {
        Row: {
          id: number;
          ticket_id: string;
          qr_code_data: string;
          qr_code_image: string;
          status: string;
          created_at: string;
          used_at: string | null;
          out_count: number;
        };
        Insert: {
          id?: never;
          ticket_id: string;
          qr_code_data: string;
          qr_code_image: string;
          status?: string;
          created_at?: string;
          used_at?: string | null;
          out_count?: number;
        };
        Update: {
          id?: never;
          ticket_id?: string;
          qr_code_data?: string;
          qr_code_image?: string;
          status?: string;
          created_at?: string;
          used_at?: string | null;
          out_count?: number;
        };
      };
      vip_tickets: {
        Row: {
          id: number;
          ticket_id: string;
          qr_code_data: string;
          qr_code_image: string;
          status: string;
          created_at: string;
          used_at: string | null;
          out_count: number;
        };
        Insert: {
          id?: never;
          ticket_id: string;
          qr_code_data: string;
          qr_code_image: string;
          status?: string;
          created_at?: string;
          used_at?: string | null;
          out_count?: number;
        };
        Update: {
          id?: never;
          ticket_id?: string;
          qr_code_data?: string;
          qr_code_image?: string;
          status?: string;
          created_at?: string;
          used_at?: string | null;
          out_count?: number;
        };
      };
      regular_tickets: {
        Row: {
          id: number;
          ticket_id: string;
          qr_code_data: string;
          qr_code_image: string;
          status: string;
          created_at: string;
          used_at: string | null;
          out_count: number;
        };
        Insert: {
          id?: never;
          ticket_id: string;
          qr_code_data: string;
          qr_code_image: string;
          status?: string;
          created_at?: string;
          used_at?: string | null;
          out_count?: number;
        };
        Update: {
          id?: never;
          ticket_id?: string;
          qr_code_data?: string;
          qr_code_image?: string;
          status?: string;
          created_at?: string;
          used_at?: string | null;
          out_count?: number;
        };
      };
    };
  };
}
