-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id); 