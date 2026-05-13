export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          created_at: string;
        };
        Insert: {
          id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
        };
      };
      pets: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          species: "강아지" | "고양이" | "기타";
          breed: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          species: "강아지" | "고양이" | "기타";
          breed?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          species?: "강아지" | "고양이" | "기타";
          breed?: string | null;
          created_at?: string;
        };
      };
      daily_photos: {
        Row: {
          id: string;
          pet_id: string;
          date: string;
          image_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          pet_id: string;
          date: string;
          image_url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          pet_id?: string;
          date?: string;
          image_url?: string;
          created_at?: string;
        };
      };
    };
  };
}
