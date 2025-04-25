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
        };
        Insert: {
          ticket_id: string;
          qr_code_data: string;
          qr_code_image: string;
          status?: string;
        };
        Update: {
          status?: string;
          used_at?: string;
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
        };
        Insert: {
          ticket_id: string;
          qr_code_data: string;
          qr_code_image: string;
          status?: string;
        };
        Update: {
          status?: string;
          used_at?: string;
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
        };
        Insert: {
          ticket_id: string;
          qr_code_data: string;
          qr_code_image: string;
          status?: string;
        };
        Update: {
          status?: string;
          used_at?: string;
        };
      };
    };
  };
}
