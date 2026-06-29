'use client'
import { createContext, useContext } from 'react'
import { getModule, plural, type ModuleConfig } from '@/config/modules'

type NicheCtx = { niche: string; module: ModuleConfig; term: ModuleConfig['terminology']; plural: typeof plural }
const Ctx = createContext<NicheCtx>({ niche: 'solar_epc', module: getModule('solar_epc'), term: getModule('solar_epc').terminology, plural })

export function NicheProvider({ niche, children }: { niche: string; children: React.ReactNode }) {
  const module = getModule(niche)
  return <Ctx.Provider value={{ niche, module, term: module.terminology, plural }}>{children}</Ctx.Provider>
}

export function useNiche() { return useContext(Ctx) }
