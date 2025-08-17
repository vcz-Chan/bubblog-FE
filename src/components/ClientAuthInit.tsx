'use client';
import { useEffect } from 'react';
import { useAuthStore, selectInit } from '@/store/AuthStore';

export default function ClientAuthInit() {
  const init = useAuthStore(selectInit);
  useEffect(() => { void init(); }, [init]);
  return null; // UI 없음
}