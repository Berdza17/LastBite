export type Profile = {
  id: string
  user_id: string
  role: 'buyer' | 'seller'
  is_verified: boolean
  created_at: string
  updated_at: string
  full_name?: string
  business_name?: string
  phone_number?: string
  address?: string
}

export type Database = {
  public: {
    tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id'>>
      }
    }
  }
} 