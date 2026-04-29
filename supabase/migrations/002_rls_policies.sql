ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE charity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;

-- users
CREATE POLICY "Users can select own row" ON users FOR SELECT USING (auth.uid() = auth_id);

-- subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (
  user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
);
CREATE POLICY "Users can update own subscriptions" ON subscriptions FOR UPDATE USING (
  user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
);

-- scores
CREATE POLICY "Users can select own scores" ON scores FOR SELECT USING (
  user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
);
CREATE POLICY "Users can insert own scores" ON scores FOR INSERT WITH CHECK (
  user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
);
CREATE POLICY "Users can update own scores" ON scores FOR UPDATE USING (
  user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
);
CREATE POLICY "Users can delete own scores" ON scores FOR DELETE USING (
  user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
);

-- donations
CREATE POLICY "Users can view own donations" ON donations FOR SELECT USING (
  user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
);

-- draw_entries
CREATE POLICY "Users can view own draw_entries" ON draw_entries FOR SELECT USING (
  user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
);

-- winners
CREATE POLICY "Users can view own winners" ON winners FOR SELECT USING (
  user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
);

-- charities
CREATE POLICY "Anyone authenticated can view charities" ON charities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins have full access to charities" ON charities FOR ALL USING (
  (SELECT role FROM users WHERE auth_id = auth.uid()) = 'admin'
);

-- charity_events
CREATE POLICY "Anyone authenticated can view charity_events" ON charity_events FOR SELECT TO authenticated USING (true);

-- draws
CREATE POLICY "Subscribers can view published draws" ON draws FOR SELECT USING (status = 'published');
CREATE POLICY "Admins have full access to draws" ON draws FOR ALL USING (
  (SELECT role FROM users WHERE auth_id = auth.uid()) = 'admin'
);
