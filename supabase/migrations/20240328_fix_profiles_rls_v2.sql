-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can create profiles" ON profiles;

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

-- Allow service role to create profiles (this is needed for signup flow)
CREATE POLICY "Service role can create profiles" ON profiles
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Grant necessary permissions to service role
GRANT ALL ON profiles TO service_role; 