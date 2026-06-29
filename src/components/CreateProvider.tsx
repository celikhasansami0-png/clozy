'use client'
import { createContext, useContext, useState } from 'react'
import ProjectForm from './forms/ProjectForm'
import TaskForm from './forms/TaskForm'
import PermitForm from './forms/PermitForm'
import MemberForm from './forms/MemberForm'
import type { Task } from '@/lib/types'

type Modal =
  | { type: 'project' }
  | { type: 'task'; jobId?: string; task?: Task }
  | { type: 'permit' }
  | { type: 'member' }

type Ctx = {
  newProject: () => void
  newTask: (jobId?: string) => void
  editTask: (task: Task) => void
  newPermit: () => void
  newMember: () => void
}

const CreateContext = createContext<Ctx | null>(null)
export function useCreate() {
  const ctx = useContext(CreateContext)
  if (!ctx) throw new Error('useCreate must be used within CreateProvider')
  return ctx
}

export default function CreateProvider({ userId, children }: { userId: string; children: React.ReactNode }) {
  const [modal, setModal] = useState<Modal | null>(null)
  const close = () => setModal(null)

  const value: Ctx = {
    newProject: () => setModal({ type: 'project' }),
    newTask: (jobId?: string) => setModal({ type: 'task', jobId }),
    editTask: (task: Task) => setModal({ type: 'task', task }),
    newPermit: () => setModal({ type: 'permit' }),
    newMember: () => setModal({ type: 'member' }),
  }

  return (
    <CreateContext.Provider value={value}>
      {children}
      {modal?.type === 'project' && <ProjectForm userId={userId} onClose={close} />}
      {modal?.type === 'task' && <TaskForm userId={userId} onClose={close} jobId={modal.jobId} task={modal.task} />}
      {modal?.type === 'permit' && <PermitForm userId={userId} onClose={close} />}
      {modal?.type === 'member' && <MemberForm userId={userId} onClose={close} />}
    </CreateContext.Provider>
  )
}
