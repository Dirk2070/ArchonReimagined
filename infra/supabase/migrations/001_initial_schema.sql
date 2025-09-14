-- Enable RLS
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Games table
CREATE TABLE games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  opponent_type TEXT CHECK (opponent_type IN ('ai', 'human')) DEFAULT 'ai',
  ai_difficulty TEXT CHECK (ai_difficulty IN ('beginner', 'normal', 'expert')),
  game_state JSONB NOT NULL,
  status TEXT CHECK (status IN ('active', 'completed', 'abandoned')) DEFAULT 'active',
  winner TEXT CHECK (winner IN ('light', 'dark', 'draw')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  turn_count INTEGER DEFAULT 0,
  light_cycle INTEGER DEFAULT 0
);

-- Game actions table (for replay functionality)
CREATE TABLE game_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE NOT NULL,
  action_number INTEGER NOT NULL,
  player_side TEXT CHECK (player_side IN ('light', 'dark')) NOT NULL,
  action_type TEXT CHECK (action_type IN ('move', 'combat', 'spell')) NOT NULL,
  action_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(game_id, action_number)
);

-- Leaderboard table
CREATE TABLE leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  game_mode TEXT CHECK (game_mode IN ('single_player', 'multiplayer')) DEFAULT 'single_player',
  ai_difficulty TEXT CHECK (ai_difficulty IN ('beginner', 'normal', 'expert')),
  score INTEGER NOT NULL,
  turns INTEGER NOT NULL,
  victory_type TEXT CHECK (victory_type IN ('elimination', 'power_points', 'time_out')),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_games_player_id ON games(player_id);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_game_actions_game_id ON game_actions(game_id);
CREATE INDEX idx_leaderboard_player_id ON leaderboard(player_id);
CREATE INDEX idx_leaderboard_score ON leaderboard(score DESC);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view their own games" ON games
  FOR SELECT USING (auth.uid() = player_id);

CREATE POLICY "Users can insert their own games" ON games
  FOR INSERT WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Users can update their own games" ON games
  FOR UPDATE USING (auth.uid() = player_id);

CREATE POLICY "Users can view actions from their games" ON game_actions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = game_actions.game_id
      AND games.player_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert actions for their games" ON game_actions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = game_actions.game_id
      AND games.player_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view leaderboard" ON leaderboard
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own leaderboard entries" ON leaderboard
  FOR INSERT WITH CHECK (auth.uid() = player_id);

-- Functions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
