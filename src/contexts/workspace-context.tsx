"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { CrewMember, Project, Task } from "@/lib/types";

type WorkspaceContextValue = {
  loading: boolean;
  projects: Project[];
  crewMembers: CrewMember[];
  tasks: Task[];
  addProject: (
    project: Pick<Project, "name" | "color" | "status" | "phase">
  ) => Promise<{ error: string | null }>;
  addCrewMember: (
    member: Pick<CrewMember, "name" | "role"> & { initials: string }
  ) => Promise<{ error: string | null }>;
  addTask: (
    task: Pick<Task, "project_id" | "title" | "priority" | "assignee_id" | "due_date">
  ) => Promise<{ error: string | null }>;
  updateTask: (id: string, changes: Partial<Task>) => Promise<{ error: string | null }>;
  isNewProjectModalOpen: boolean;
  openNewProjectModal: () => void;
  closeNewProjectModal: () => void;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const [projectsRes, crewRes, tasksRes] = await Promise.all([
        supabase
          .from("projects")
          .select("*")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("crew_members")
          .select("*")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: true }),
        supabase
          .from("tasks")
          .select("*")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      setProjects((projectsRes.data as Project[]) ?? []);
      setCrewMembers((crewRes.data as CrewMember[]) ?? []);
      setTasks((tasksRes.data as Task[]) ?? []);
      setLoading(false);
    }

    load();
  }, []);

  const addProject = useCallback<WorkspaceContextValue["addProject"]>(
    async (project) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return { error: "You need to be logged in." };

      const { data, error } = await supabase
        .from("projects")
        .insert({ ...project, owner_id: user.id })
        .select()
        .single();

      if (error) return { error: error.message };

      setProjects((prev) => [data as Project, ...prev]);
      return { error: null };
    },
    []
  );

  const addCrewMember = useCallback<WorkspaceContextValue["addCrewMember"]>(
    async (member) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return { error: "You need to be logged in." };

      const { data, error } = await supabase
        .from("crew_members")
        .insert({ ...member, owner_id: user.id })
        .select()
        .single();

      if (error) return { error: error.message };

      setCrewMembers((prev) => [...prev, data as CrewMember]);
      return { error: null };
    },
    []
  );

  const addTask = useCallback<WorkspaceContextValue["addTask"]>(async (task) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "You need to be logged in." };

    const { data, error } = await supabase
      .from("tasks")
      .insert({ ...task, owner_id: user.id })
      .select()
      .single();

    if (error) return { error: error.message };

    setTasks((prev) => [data as Task, ...prev]);
    return { error: null };
  }, []);

  const updateTask = useCallback<WorkspaceContextValue["updateTask"]>(
    async (id, changes) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("tasks")
        .update(changes)
        .eq("id", id)
        .select()
        .single();

      if (error) return { error: error.message };

      setTasks((prev) => prev.map((t) => (t.id === id ? (data as Task) : t)));
      return { error: null };
    },
    []
  );

  const value = useMemo(
    () => ({
      loading,
      projects,
      crewMembers,
      tasks,
      addProject,
      addCrewMember,
      addTask,
      updateTask,
      isNewProjectModalOpen,
      openNewProjectModal: () => setIsNewProjectModalOpen(true),
      closeNewProjectModal: () => setIsNewProjectModalOpen(false),
    }),
    [
      loading,
      projects,
      crewMembers,
      tasks,
      addProject,
      addCrewMember,
      addTask,
      updateTask,
      isNewProjectModalOpen,
    ]
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return ctx;
}
