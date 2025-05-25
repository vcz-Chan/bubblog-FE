'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  login as loginAPI,
  logout as logoutAPI,
  reissueToken,
} from '@/services/auth';

interface AuthContextType {
  userId: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // 페이지 로드 시 무조건 reissue 호출
    reissueToken()
      .then(res => {
        if (res.success) {
          // 쿠키에 refreshToken이 있으면 성공
          localStorage.setItem('accessToken', res.data.accessToken);
          setUserId(res.data.userId);
        } else {
          // refreshToken 없거나 만료됐을 때
          localStorage.removeItem('accessToken');
          setUserId(null);
        }
      })
      .catch(() => {
        // 네트워크 오류 등
        localStorage.removeItem('accessToken');
        setUserId(null);
      });
  }, []);

  const login = async (email: string, password: string) => {
    const res = await loginAPI({ email, password });
    if (!res.success) {
      throw new Error(res.message || '로그인 실패');
    }
    // 로그인 시 accessToken과 userId 저장
    localStorage.setItem('accessToken', res.data.accessToken);
    setUserId(res.data.userId);
  };

  const logout = async () => {
    const res = await logoutAPI();
    if (!res.success) {
      throw new Error(res.message || '로그아웃 실패');
    }
    // 로그아웃 시 쿠키(refreshToken)도 삭제되므로
    localStorage.removeItem('accessToken');
    setUserId(null);
  };

  return (
    <AuthContext.Provider
      value={{
        userId,
        login,
        logout,
        isAuthenticated: Boolean(userId),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};