// Bionova niche module configuration — drives all dynamic UI labels & demo data.

export interface ModuleConfig {
  name: string
  icon: string
  stages: string[]
  metrics: string[]
  terminology: { project: string; task: string; team: string; schedule: string }
  dashboardWidgets: string[]
  permitTypes: string[]
}

export const MODULES = {
  solar_epc: {
    name: 'Solar EPC',
    icon: '☀️',
    stages: ['Site Survey', 'Design', 'Permitting', 'Construction', 'Commissioning'],
    metrics: ['MW Capacity', 'Panel Count', 'Grid Connection Date'],
    terminology: { project: 'Project', task: 'Task', team: 'Crew', schedule: 'Schedule' },
    dashboardWidgets: ['activeProjects', 'urgentTasks', 'permitStatus', 'crewAvailability'],
    permitTypes: ['Electrical', 'Building', 'Grid Connection', 'Environmental'],
  },
  bess: {
    name: 'Battery Storage (BESS)',
    icon: '🔋',
    stages: ['Feasibility', 'Design', 'Procurement', 'Installation', 'Testing', 'Commissioning'],
    metrics: ['MWh Capacity', 'Cycle Count', 'State of Charge'],
    terminology: { project: 'Project', task: 'Task', team: 'Team', schedule: 'Schedule' },
    dashboardWidgets: ['activeProjects', 'urgentTasks', 'permitStatus', 'teamAvailability'],
    permitTypes: ['Electrical', 'Building', 'Fire Safety', 'Grid Connection'],
  },
  ev_charging: {
    name: 'EV Charging Infrastructure',
    icon: '⚡',
    stages: ['Site Assessment', 'Permitting', 'Civil Work', 'Installation', 'Commissioning'],
    metrics: ['Charger Count', 'Total kW', 'Sites Active'],
    terminology: { project: 'Site', task: 'Task', team: 'Team', schedule: 'Schedule' },
    dashboardWidgets: ['activeSites', 'urgentTasks', 'permitStatus', 'teamAvailability'],
    permitTypes: ['Electrical', 'Building', 'Utility Interconnection'],
  },
  wind: {
    name: 'Wind Energy',
    icon: '🌬️',
    stages: ['Wind Assessment', 'Design', 'Permitting', 'Construction', 'Commissioning'],
    metrics: ['MW Capacity', 'Turbine Count', 'Capacity Factor'],
    terminology: { project: 'Project', task: 'Task', team: 'Team', schedule: 'Schedule' },
    dashboardWidgets: ['activeProjects', 'urgentTasks', 'permitStatus', 'teamAvailability'],
    permitTypes: ['Environmental', 'FAA', 'Grid Connection', 'Building'],
  },
  hydro: {
    name: 'Hydroelectric',
    icon: '💧',
    stages: ['Feasibility', 'Environmental Study', 'Design', 'Construction', 'Commissioning'],
    metrics: ['MW Capacity', 'Flow Rate', 'Head Height'],
    terminology: { project: 'Project', task: 'Task', team: 'Team', schedule: 'Schedule' },
    dashboardWidgets: ['activeProjects', 'urgentTasks', 'permitStatus', 'teamAvailability'],
    permitTypes: ['FERC License', 'Environmental', 'Water Rights', 'Building'],
  },
  biogas: {
    name: 'Biogas & Biomass',
    icon: '🌱',
    stages: ['Feedstock Analysis', 'Design', 'Permitting', 'Construction', 'Commissioning'],
    metrics: ['MW Capacity', 'Feedstock Volume', 'Gas Output'],
    terminology: { project: 'Project', task: 'Task', team: 'Team', schedule: 'Schedule' },
    dashboardWidgets: ['activeProjects', 'urgentTasks', 'permitStatus', 'teamAvailability'],
    permitTypes: ['Environmental', 'Air Quality', 'Building', 'Utility'],
  },
  om: {
    name: 'O&M Operations',
    icon: '⚙️',
    stages: ['Inspection', 'Maintenance', 'Repair', 'Reporting', 'Optimization'],
    metrics: ['Assets Managed', 'Uptime %', 'Open Work Orders'],
    terminology: { project: 'Asset', task: 'Work Order', team: 'Field Team', schedule: 'Maintenance Schedule' },
    dashboardWidgets: ['activeAssets', 'openWorkOrders', 'uptime', 'teamAvailability'],
    permitTypes: ['Work Permit', 'Safety', 'Environmental'],
  },
  consulting: {
    name: 'Energy Consulting',
    icon: '🏗️',
    stages: ['Assessment', 'Analysis', 'Recommendation', 'Implementation', 'Review'],
    metrics: ['Active Clients', 'Reports Delivered', 'Revenue Pipeline'],
    terminology: { project: 'Engagement', task: 'Deliverable', team: 'Consultants', schedule: 'Timeline' },
    dashboardWidgets: ['activeEngagements', 'deliverables', 'clientHealth', 'teamAvailability'],
    permitTypes: ['N/A'],
  },
} satisfies Record<string, ModuleConfig>

export type NicheKey = keyof typeof MODULES

// Niche-specific metadata fields shown on project creation, saved into jobs.metadata.
export interface ProjectField { key: string; label: string; type: 'number' | 'text' }
export const NICHE_PROJECT_FIELDS: Record<NicheKey, ProjectField[]> = {
  solar_epc: [{ key: 'mw_capacity', label: 'MW Capacity', type: 'number' }, { key: 'panel_count', label: 'Panel Count', type: 'number' }],
  bess: [{ key: 'mwh_capacity', label: 'MWh Capacity', type: 'number' }, { key: 'cycle_target', label: 'Cycle Target', type: 'number' }],
  ev_charging: [{ key: 'charger_count', label: 'Charger Count', type: 'number' }, { key: 'total_kw', label: 'Total kW', type: 'number' }],
  wind: [{ key: 'mw_capacity', label: 'MW Capacity', type: 'number' }, { key: 'turbine_count', label: 'Turbine Count', type: 'number' }],
  hydro: [{ key: 'mw_capacity', label: 'MW Capacity', type: 'number' }, { key: 'flow_rate', label: 'Flow Rate', type: 'number' }],
  biogas: [{ key: 'mw_capacity', label: 'MW Capacity', type: 'number' }, { key: 'feedstock_volume', label: 'Feedstock Volume', type: 'number' }],
  om: [{ key: 'asset_type', label: 'Asset Type', type: 'text' }],
  consulting: [{ key: 'client_industry', label: 'Client Industry', type: 'text' }],
}
export function getProjectFields(niche: string): ProjectField[] {
  return NICHE_PROJECT_FIELDS[niche as NicheKey] ?? []
}

export const NICHE_KEYS = Object.keys(MODULES) as NicheKey[]

// Onboarding display order (Task 2).
export const ONBOARDING_ORDER: NicheKey[] = ['solar_epc', 'bess', 'ev_charging', 'wind', 'hydro', 'biogas', 'om', 'consulting']

export function getModule(niche: string | null | undefined): ModuleConfig {
  return MODULES[(niche as NicheKey)] ?? MODULES.solar_epc
}

// Simple pluralizer for nav labels (Project → Projects, Asset → Assets).
export function plural(word: string): string {
  if (/s$/i.test(word)) return word
  if (/y$/i.test(word)) return word.slice(0, -1) + 'ies'
  return word + 's'
}
