-- Scouting — AI LinkedIn Outreach: Supabase Schema
-- Run this in the Supabase SQL Editor AFTER schema.sql (it reuses public.profiles).

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Drop existing (cascade) ──────────────────────────────────────────────────
DROP TABLE IF EXISTS public.scouting_conversations CASCADE;
DROP TABLE IF EXISTS public.scouting_messages CASCADE;
DROP TABLE IF EXISTS public.scouting_leads CASCADE;
DROP TABLE IF EXISTS public.scouting_campaigns CASCADE;
DROP TABLE IF EXISTS public.scouting_icps CASCADE;
DROP TABLE IF EXISTS public.scouting_voice_profiles CASCADE;

-- ─── Voice Profiles ───────────────────────────────────────────────────────────
CREATE TABLE public.scouting_voice_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  formality_level SMALLINT NOT NULL DEFAULT 3 CHECK (formality_level BETWEEN 1 AND 5),
  avg_message_length INT NOT NULL DEFAULT 300,
  opening_style TEXT NOT NULL DEFAULT 'observation' CHECK (opening_style IN ('question','statement','compliment','observation')),
  uses_humor BOOLEAN NOT NULL DEFAULT FALSE,
  characteristic_phrases TEXT[] NOT NULL DEFAULT '{}',
  phrases_to_avoid TEXT[] NOT NULL DEFAULT '{}',
  sign_off_style TEXT,
  training_messages TEXT[] NOT NULL DEFAULT '{}',
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── ICPs (Ideal Customer Profiles) ───────────────────────────────────────────
CREATE TABLE public.scouting_icps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  industries TEXT[] NOT NULL DEFAULT '{}',
  employee_min INT NOT NULL DEFAULT 0,
  employee_max INT NOT NULL DEFAULT 10000,
  funding_stages TEXT[] NOT NULL DEFAULT '{}',
  geographies TEXT[] NOT NULL DEFAULT '{}',
  job_titles TEXT[] NOT NULL DEFAULT '{}',
  keywords TEXT[] NOT NULL DEFAULT '{}',
  exclusions TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Campaigns ────────────────────────────────────────────────────────────────
CREATE TABLE public.scouting_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  icp_id UUID REFERENCES public.scouting_icps(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'cold_outreach' CHECK (type IN ('cold_outreach','warm_outreach','event_based','re_engagement')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','paused','completed')),
  daily_connection_limit INT NOT NULL DEFAULT 20,
  daily_message_limit INT NOT NULL DEFAULT 50,
  active_hours_start TEXT NOT NULL DEFAULT '09:00',
  active_hours_end TEXT NOT NULL DEFAULT '18:00',
  active_days TEXT[] NOT NULL DEFAULT '{mon,tue,wed,thu,fri}',
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  sequence JSONB NOT NULL DEFAULT '[]',
  total_leads INT NOT NULL DEFAULT 0,
  connections_sent INT NOT NULL DEFAULT 0,
  connections_accepted INT NOT NULL DEFAULT 0,
  messages_sent INT NOT NULL DEFAULT 0,
  replies_received INT NOT NULL DEFAULT 0,
  meetings_booked INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Leads ────────────────────────────────────────────────────────────────────
CREATE TABLE public.scouting_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.scouting_campaigns(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT,
  title TEXT,
  company TEXT,
  company_domain TEXT,
  linkedin_url TEXT,
  avatar_color TEXT,
  employee_count INT,
  funding_stage TEXT,
  last_funding_date DATE,
  location TEXT,
  tech_stack TEXT[] NOT NULL DEFAULT '{}',
  last_activity TEXT,
  icp_score INT NOT NULL DEFAULT 0,
  intent_score INT NOT NULL DEFAULT 0,
  engagement_score INT NOT NULL DEFAULT 0,
  total_score INT NOT NULL DEFAULT 0,
  intent_signals JSONB NOT NULL DEFAULT '[]',
  research_brief JSONB,
  stage TEXT NOT NULL DEFAULT 'prospected' CHECK (stage IN (
    'prospected','connection_sent','connected','messaged','replied',
    'meeting_booked','qualified','closed_won','closed_lost','nurture'
  )),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','replied','booked','closed_won','closed_lost','nurture')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_contacted_at TIMESTAMPTZ
);
CREATE INDEX idx_scouting_leads_user ON public.scouting_leads(user_id);
CREATE INDEX idx_scouting_leads_campaign ON public.scouting_leads(campaign_id);
CREATE INDEX idx_scouting_leads_stage ON public.scouting_leads(stage);

-- ─── Messages ─────────────────────────────────────────────────────────────────
CREATE TABLE public.scouting_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES public.scouting_leads(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.scouting_campaigns(id) ON DELETE SET NULL,
  sequence_step INT NOT NULL DEFAULT 1,
  type TEXT NOT NULL CHECK (type IN ('connection_request','message','follow_up','reply')),
  direction TEXT NOT NULL DEFAULT 'outbound' CHECK (direction IN ('outbound','inbound')),
  content TEXT NOT NULL,
  generated_by TEXT NOT NULL DEFAULT 'ai' CHECK (generated_by IN ('ai','human','ai_edited')),
  personalization_hooks TEXT[] NOT NULL DEFAULT '{}',
  confidence INT,
  quality JSONB,
  variant TEXT CHECK (variant IN ('A','B')),
  ai_classification TEXT,
  ai_suggested_responses JSONB,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','sent','delivered','read')),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_scouting_messages_lead ON public.scouting_messages(lead_id);

-- ─── Conversations (Inbox) ────────────────────────────────────────────────────
CREATE TABLE public.scouting_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES public.scouting_leads(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.scouting_campaigns(id) ON DELETE SET NULL,
  classification TEXT CHECK (classification IN ('hot','warm','nurture','not_interested','unclear','out_of_office')),
  unread BOOLEAN NOT NULL DEFAULT TRUE,
  messages JSONB NOT NULL DEFAULT '[]',
  suggested_replies JSONB NOT NULL DEFAULT '[]',
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_scouting_conversations_user ON public.scouting_conversations(user_id);

-- ─── Row Level Security ───────────────────────────────────────────────────────
ALTER TABLE public.scouting_voice_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scouting_icps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scouting_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scouting_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scouting_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scouting_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CRUD own voice profiles" ON public.scouting_voice_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "CRUD own icps" ON public.scouting_icps FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "CRUD own campaigns" ON public.scouting_campaigns FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "CRUD own leads" ON public.scouting_leads FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "CRUD own messages" ON public.scouting_messages FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "CRUD own conversations" ON public.scouting_conversations FOR ALL USING (auth.uid() = user_id);

-- ─── Updated-at triggers (reuses public.update_updated_at from schema.sql) ─────
CREATE TRIGGER trg_voice_updated BEFORE UPDATE ON public.scouting_voice_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_icps_updated BEFORE UPDATE ON public.scouting_icps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_campaigns_updated BEFORE UPDATE ON public.scouting_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_leads_updated BEFORE UPDATE ON public.scouting_leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
