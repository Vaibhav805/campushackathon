export interface UserProfile {
  id: string;
  name: string;
  year: string;
  skills: string[];
  interests: string[];
  goal: string;
  projects?: string[];
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
    };
  };
}
