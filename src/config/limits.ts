// Central resource limits for Doppio. Sized for larger enterprise customers
// with bigger teams and more data.
//
// Server-side enforcement: per-file size is enforced by the Supabase Storage
// bucket (see migrations); per-project document count is enforced in
// DocumentsPanel; all list queries are capped with explicit `.limit()`.
export const LIMITS = {
  projectsPerAccount: 500,        // was 50
  tasksPerAccount: 10000,         // was 1000
  teamMembersPerAccount: 150,     // was 25
  documentsPerAccount: 2000,      // was 200
  documentsPerProject: 300,       // was 50
  fileSizeBytes: 50 * 1024 * 1024,            // 50 MB — was 10 MB
  companyStorageBytes: 10 * 1024 * 1024 * 1024, // 10 GB — was 500 MB
  aiMessagesPerDay: 300,          // was 50
  pageSize: 50,                   // was 30
}
