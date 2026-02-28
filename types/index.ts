export interface UserProfile {
  id: string;
  name: string;
  year: string;
  skills: string[];
  interests: string[];
  goal: string;
  projects?: string[];
}

export type ConnectionStatus = "pending" | "accepted" | "rejected";

export interface ConnectionRow {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: ConnectionStatus;
  created_at: string;
}

export type UserProfileRow = Pick<
  UserProfile,
  "id" | "name" | "year" | "skills" | "interests" | "goal"
>;

export interface Database {
  public: {
    Tables: {
      users: {
        Row: UserProfile;
        Insert: Omit<UserProfile, "id"> & { id: string };
        Update: Partial<Omit<UserProfile, "id">>;
      };
      connections: {
        Row: ConnectionRow;
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id: string;
          status: ConnectionStatus;
          created_at?: string;
        };
        Update: Partial<Omit<ConnectionRow, "id">>;
      };
    };
  };
}
