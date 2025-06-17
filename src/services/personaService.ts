import { apiClient } from './apiClient'
import { APIResponse } from '@/utils/types'

export interface Persona {
  id: string
  name: string
  description: string
}

export async function getPersonasByUser(userId: string): Promise<Persona[]> {
  const res: APIResponse<Persona[]> = await apiClient(
    `/api/personas/user/${userId}`,
    { method: 'GET' }
  )
  if (!res.success) {
    throw new Error(res.message)
  }
  return res.data!
}

export async function createPersona(params: {
  name: string
  description: string
}): Promise<Persona> {
  const res: APIResponse<Persona> = await apiClient(
    `/api/personas`,
    {
      method: 'POST',
      body: JSON.stringify(params),
    }
  )
  if (!res.success) {
    throw new Error(res.message)
  }
  return res.data!
}

export async function updatePersona(
  personaId: string,
  params: { name: string; description: string }
): Promise<Persona> {
  const res: APIResponse<Persona> = await apiClient(
    `/api/personas/${personaId}`,
    {
      method: 'PUT',
      body: JSON.stringify(params),
    }
  )
  if (!res.success) {
    throw new Error(res.message)
  }
  return res.data!
}

export async function deletePersona(personaId: string): Promise<void> {
  const res: APIResponse<null> = await apiClient(
    `/api/personas/${personaId}`,
    { method: 'DELETE' }
  )
  if (!res.success) {
    throw new Error(res.message)
  }
}