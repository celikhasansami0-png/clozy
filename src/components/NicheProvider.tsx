'use client'
import { createContext, useContext } from 'react'
import { GENERIC_MODULE, plural, type ModuleConfig } from '@/config/modules'

// Scout is industry-agnostic: terminology is fixed and generic for every user.
// This provider is kept (rather than ripping out every useNiche() call site) but
// it now always returns the single GENERIC_MODULE — no niche switching.
type NicheCtx = { niche: string; module: ModuleConfig; term: ModuleConfig['terminology']; plural: typeof plural }
const VALUE: NicheCtx = { niche: '', module: GENERIC_MODULE, term: GENERIC_MODULE.terminology, plural }
const Ctx = createContext<NicheCtx>(VALUE)

export function NicheProvider({ children }: { children: React.ReactNode }) {
  return <Ctx.Provider value={VALUE}>{children}</Ctx.Provider>
}

export function useNiche() { return useContext(Ctx) }
