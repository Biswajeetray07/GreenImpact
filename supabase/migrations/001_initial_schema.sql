CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email text NOT NULL UNIQUE,
    full_name text NOT NULL,
    role text NOT NULL DEFAULT 'subscriber' CHECK (role IN ('subscriber','admin')),
    created_at timestamptz DEFAULT now()
);

CREATE TABLE subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan text NOT NULL CHECK (plan IN ('monthly','yearly')),
    status text NOT NULL DEFAULT 'inactive' CHECK (status IN ('active','cancelled','lapsed','inactive')),
    stripe_subscription_id text UNIQUE,
    stripe_customer_id text,
    charity_id uuid,
    charity_percentage integer NOT NULL DEFAULT 10 CHECK (charity_percentage >= 10 AND charity_percentage <= 100),
    current_period_end timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE charities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    image_url text,
    website text,
    is_featured boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE charity_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    charity_id uuid NOT NULL REFERENCES charities(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    event_date date NOT NULL,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE donations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id),
    charity_id uuid NOT NULL REFERENCES charities(id),
    amount decimal(10,2) NOT NULL,
    type text NOT NULL CHECK (type IN ('subscription_split','independent')),
    created_at timestamptz DEFAULT now()
);

CREATE TABLE scores (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score integer NOT NULL CHECK (score >= 1 AND score <= 45),
    date date NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE (user_id, date)
);

CREATE TABLE draws (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    month date NOT NULL UNIQUE,
    status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','simulated','published')),
    draw_type text NOT NULL CHECK (draw_type IN ('random','algorithm')),
    drawn_numbers integer[],
    jackpot_rollover boolean DEFAULT false,
    prize_pool_total decimal(10,2) DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE draw_entries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    draw_id uuid NOT NULL REFERENCES draws(id),
    user_id uuid NOT NULL REFERENCES users(id),
    user_scores integer[],
    match_count integer DEFAULT 0,
    tier integer CHECK (tier IN (3,4,5)),
    created_at timestamptz DEFAULT now()
);

CREATE TABLE winners (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    draw_id uuid NOT NULL REFERENCES draws(id),
    user_id uuid NOT NULL REFERENCES users(id),
    tier integer NOT NULL CHECK (tier IN (3,4,5)),
    prize_amount decimal(10,2) NOT NULL DEFAULT 0,
    proof_url text,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','paid')),
    reviewed_at timestamptz,
    paid_at timestamptz,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ADD CONSTRAINT fk_charity FOREIGN KEY (charity_id) REFERENCES charities(id);
