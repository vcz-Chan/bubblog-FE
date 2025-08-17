import { 
    apiClientWithAuth,
    apiClientNoAuth,
 } from '@/apis/apiClient';
 
import { APIResponse } from '@/utils/types';

export interface Persona {
  id: number;
  name: string;
  description: string;
}

/**
 * 1. 사용자별 페르소나 목록 조회 (인증 필요)
 */
export async function getPersonasByUser(userId: string): Promise<Persona[]> {
  const res = await apiClientWithAuth<Persona[]>(
    `/api/personas/user/${userId}`,
    { method: 'GET' }
  );
  if (!res.success) {
    throw new Error(res.message);
  }
  return res.data!;
}

/**
 * 2. 페르소나 생성 (인증 필요)
 */
export async function createPersona(params: {
  name: string;
  description: string;
}): Promise<Persona> {
  const res = await apiClientWithAuth<Persona>(
    `/api/personas`,
    {
      method: 'POST',
      body: JSON.stringify(params),
    }
  );
  if (!res.success) {
    throw new Error(res.message);
  }
  return res.data!;
}

/**
 * 3. 페르소나 수정 (인증 필요)
 */
export async function updatePersona(
  personaId: number,
  params: { name: string; description: string }
): Promise<Persona> {
  const res = await apiClientWithAuth<Persona>(
    `/api/personas/${personaId}`,
    {
      method: 'PUT',
      body: JSON.stringify(params),
    }
  );
  if (!res.success) {
    throw new Error(res.message);
  }
  return res.data!;
}

/**
 * 4. 페르소나 삭제 (인증 필요)
 */
export async function deletePersona(personaId: number): Promise<void> {
  const res = await apiClientWithAuth<null>(
    `/api/personas/${personaId}`,
    { method: 'DELETE' }
  );
  if (!res.success) {
    throw new Error(res.message);
  }
}