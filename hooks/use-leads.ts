"use client"

// This hook is kept for compatibility but is no longer used in the academic OS.
// Academic tasks are managed via use-tasks.ts with the academic_tasks table.
export function useLeads() {
  return {
    leads: [],
    loading: false,
    error: null,
    refetch: async () => {},
    createLead: async () => { throw new Error("Not implemented") },
    updateLead: async () => { throw new Error("Not implemented") },
    updateLeadStage: async () => { throw new Error("Not implemented") },
    deleteLead: async () => {},
    leadsByStage: () => [],
    total: 0,
  }
}
