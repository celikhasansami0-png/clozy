-- Engineering Autopilot OS — Supabase Schema
-- Run this in the Supabase SQL Editor

-- ─── Extensions ───────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ─── Drop existing tables (cascade to remove all dependencies) ────────────────
DROP TABLE IF EXISTS public.usage_limits CASCADE;
DROP TABLE IF EXISTS public.career_profiles CASCADE;
DROP TABLE IF EXISTS public.academic_tasks CASCADE;
DROP TABLE IF EXISTS public.knowledge_notes CASCADE;
DROP TABLE IF EXISTS public.research_papers CASCADE;
DROP TABLE IF EXISTS public.milestones CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.assignments CASCADE;
DROP TABLE IF EXISTS public.exam_attempts CASCADE;
DROP TABLE IF EXISTS public.exams CASCADE;
DROP TABLE IF EXISTS public.learning_sessions CASCADE;
DROP TABLE IF EXISTS public.flashcards CASCADE;
DROP TABLE IF EXISTS public.learning_materials CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ─── Profiles ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  university TEXT,
  department TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN (
    'student', 'teaching_assistant', 'professor', 'academic_advisor', 'administrator', 'super_admin'
  )),
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN (
    'en', 'tr', 'de', 'fr', 'es', 'ar', 'pt', 'it', 'ru', 'ja', 'zh', 'ko'
  )),
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'student_pro', 'team_pro', 'university')),
  subscription_status TEXT NOT NULL DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing', 'inactive')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── Courses ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  code TEXT,
  professor TEXT,
  semester TEXT,
  credit_hours INTEGER,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped')),
  color TEXT NOT NULL DEFAULT '#64748b',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Learning Materials ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.learning_materials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'pdf' CHECK (type IN (
    'pdf', 'lecture_slides', 'handwritten_notes', 'video_transcript', 'youtube', 'textbook', 'custom'
  )),
  file_url TEXT,
  content TEXT,
  topics TEXT[] DEFAULT '{}',
  processed BOOLEAN NOT NULL DEFAULT false,
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Flashcards ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.flashcards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  material_id UUID REFERENCES public.learning_materials(id) ON DELETE SET NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  next_review_at TIMESTAMPTZ,
  interval_days INTEGER NOT NULL DEFAULT 1,
  repetitions INTEGER NOT NULL DEFAULT 0,
  ease_factor DECIMAL(4, 2) NOT NULL DEFAULT 2.5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Learning Sessions ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.learning_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  topic TEXT,
  mastery_score INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Exams ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.exams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'mock' CHECK (type IN ('mock', 'past_paper', 'practice', 'oral', 'practical')),
  duration_minutes INTEGER,
  total_marks INTEGER,
  questions JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Exam Attempts ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.exam_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  score INTEGER,
  total_marks INTEGER NOT NULL,
  duration_minutes INTEGER,
  answers JSONB NOT NULL DEFAULT '{}',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ─── Assignments ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'essay' CHECK (type IN (
    'lab_report', 'research_report', 'technical_doc', 'case_study',
    'essay', 'reflection', 'presentation', 'poster'
  )),
  description TEXT,
  citation_format TEXT CHECK (citation_format IN ('ieee', 'apa', 'mla', 'harvard', 'chicago', 'custom')),
  due_date DATE,
  word_count_target INTEGER,
  content TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'review', 'submitted')),
  grade TEXT,
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Projects ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'review', 'completed', 'paused')),
  start_date DATE,
  end_date DATE,
  team_members TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Milestones ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.milestones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Research Papers ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.research_papers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  authors TEXT[] DEFAULT '{}',
  publication_year INTEGER,
  journal TEXT,
  doi TEXT,
  abstract TEXT,
  summary TEXT,
  key_findings TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  file_url TEXT,
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Knowledge Notes ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.knowledge_notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  linked_note_ids UUID[] DEFAULT '{}',
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Academic Tasks ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.academic_tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'custom' CHECK (type IN (
    'study', 'assignment', 'exam_prep', 'project_task', 'research', 'review_flashcards', 'attend_lecture', 'custom'
  )),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Career Profiles ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.career_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  target_role TEXT,
  target_industry TEXT,
  skills TEXT[] DEFAULT '{}',
  internship_experiences JSONB DEFAULT '[]',
  projects_portfolio JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Usage Limits ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.usage_limits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  month TEXT NOT NULL, -- YYYY-MM format
  lessons_generated INTEGER NOT NULL DEFAULT 0,
  exams_generated INTEGER NOT NULL DEFAULT 0,
  assignments_generated INTEGER NOT NULL DEFAULT 0,
  projects_generated INTEGER NOT NULL DEFAULT 0,
  research_analyses INTEGER NOT NULL DEFAULT 0,
  translations INTEGER NOT NULL DEFAULT 0,
  semester_plans INTEGER NOT NULL DEFAULT 0,
  portfolios_generated INTEGER NOT NULL DEFAULT 0,
  reset_at TIMESTAMPTZ NOT NULL,
  UNIQUE(user_id, month)
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_courses_user_id ON public.courses(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON public.courses(status);
CREATE INDEX IF NOT EXISTS idx_materials_user_id ON public.learning_materials(user_id);
CREATE INDEX IF NOT EXISTS idx_materials_course_id ON public.learning_materials(course_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_user_id ON public.flashcards(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_next_review ON public.flashcards(next_review_at);
CREATE INDEX IF NOT EXISTS idx_exams_user_id ON public.exams(user_id);
CREATE INDEX IF NOT EXISTS idx_exams_course_id ON public.exams(course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_user_id ON public.assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON public.assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_milestones_project_id ON public.milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_research_user_id ON public.research_papers(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_user_id ON public.knowledge_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.academic_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.academic_tasks(due_date);

-- ─── Row Level Security ───────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_limits ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- All other tables: full CRUD for own data
CREATE POLICY "Users can CRUD own courses" ON public.courses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own materials" ON public.learning_materials FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own flashcards" ON public.flashcards FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own sessions" ON public.learning_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own exams" ON public.exams FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own attempts" ON public.exam_attempts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own assignments" ON public.assignments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own projects" ON public.projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own milestones" ON public.milestones FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own research" ON public.research_papers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own notes" ON public.knowledge_notes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own tasks" ON public.academic_tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own career" ON public.career_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can read own usage" ON public.usage_limits FOR SELECT USING (auth.uid() = user_id);

-- ─── Updated At Trigger ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON public.learning_materials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_flashcards_updated_at BEFORE UPDATE ON public.flashcards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON public.exams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON public.assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON public.milestones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_research_updated_at BEFORE UPDATE ON public.research_papers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.knowledge_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.academic_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_career_updated_at BEFORE UPDATE ON public.career_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
