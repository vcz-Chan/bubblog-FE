import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  login as loginAPI,
  logout as logoutAPI,
  reissueToken as reissueAPI,
} from "@/apis/authApi";
import { useProfileStore } from "./ProfileStore"; // ProfileStore import

/**
 * Auth 상태 및 액션 정의
 * - accessToken: 인증 토큰 (null 가능)
 * - userId: 로그인한 사용자 식별자
 * - isLogin: 로그인 여부 (파생 상태이지만, 초기 렌더링 플리커 방지를 위해 명시 관리)
 * - setLogin / setLogout: 내부 상태 전환 유틸
 * - login / logout / reissue: 실제 API를 포함한 액션
 * - init: 앱 부팅 시 재수화 이후 최종 정합성 보정 및 재발급 시도
 */
export type AuthState = {
  accessToken: string | null;
  userId: string | null;
  isLogin: boolean;

  // 내부 유틸(상태 전환 전용)
  setLogin: (tokens: { accessToken: string; userId?: string | null }) => void;
  setLogout: () => void;

  // API 포함 액션
  login: (payload: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  reissue: () => Promise<void>;

  /**
   * 앱 부팅 시 호출 권장.
   * - persist 재수화가 끝난 이후 accessToken 유무로 1차 보정
   * - 서버 재발급(reissue) 시도해 최종 정합성 확보
   */
  init: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      userId: null,
      isLogin: false,

      // 내부 상태 전환: 로컬스토리지 'accessToken' 키는 apiClientWithAuth에서 사용하므로 동기화 유지
      setLogin: ({ accessToken, userId = null }) => {
        localStorage.setItem("accessToken", accessToken);
        set({ accessToken, userId, isLogin: true });
        if (userId) {
          // 로그인 시 프로필 정보 가져오기
          useProfileStore.getState().fetchProfile(userId);
        }
      },

      setLogout: () => {
        localStorage.removeItem("accessToken");
        set({ accessToken: null, userId: null, isLogin: false });
        // 로그아웃 시 프로필 정보 지우기
        useProfileStore.getState().clearProfile();
      },

      // ---- API 포함 액션 ----
      login: async ({ email, password }) => {
        const res = await loginAPI({ email, password });
        if (!res.success || !res.data?.accessToken) {
          // 서버 표준 응답에 맞춰 메시지 전달
          throw new Error(res.message || "로그인 실패");
        }
        get().setLogin({
          accessToken: res.data.accessToken,
          userId: res.data.userId ?? null,
        });
      },

      logout: async () => {
        try {
          const res = await logoutAPI();
          if (!res.success) {
            // 서버 실패여도 클라이언트 상태는 정리
            // 필요하면 throw로 올려서 별도 처리 가능
          }
        } finally {
          get().setLogout();
        }
      },

      reissue: async () => {
        const res = await reissueAPI();
        if (res.success && res.data?.accessToken && res.data.userId) {
          get().setLogin({
            accessToken: res.data.accessToken,
            userId: res.data.userId,
          });
        } else {
          // 재발급 실패 시 안전하게 로그아웃
          get().setLogout();
        }
      },

      // 선택적 초기화: persist 재수화 이후 최소 보정 + 서버 reissue 시도
      init: async () => {
        // 1) 재수화된 accessToken 기반 최소 보정
        const token = get().accessToken;
        if (token) {
          // 로컬스토리지 동기화 보장 (새 탭 등에서 persist와 다를 수 있음)
          localStorage.setItem("accessToken", token);
          set({ isLogin: true });
        } else {
          get().setLogout();
        }

        // 2) 서버 재발급 시도하여 최종 정합성 확보
        try {
          await get().reissue();
        } catch {
          // 네트워크 에러 등에서는 기존 상태 유지하되,
          // 액세스 토큰 없으면 로그아웃 상태로 유지
          if (!get().accessToken) get().setLogout();
        }
      },
    }),
    {
      name: "auth-storage",
      // Next.js(App Router) SSR 안전: 함수가 클라이언트에서만 실행되므로 안전
      storage: createJSONStorage(() => localStorage),

      // 저장/복원 대상 최소화
      partialize: (state) => ({
        accessToken: state.accessToken,
        userId: state.userId,
        isLogin: state.isLogin,
      }),

      /**
       * 재수화 라이프사이클 훅
       * - 외부 set을 직접 호출하지 말고, 스토어 액션을 사용한다.
       */
      onRehydrateStorage: () => (state, error) => {
        // error 발생 시 안전하게 로그아웃
        if (error) {
          queueMicrotask(() => {
            useAuthStore.getState().setLogout();
          });
          return;
        }

        // 정상 재수화 시 토큰 존재 여부로 최소 상태 보정
        queueMicrotask(() => {
          const token = state?.accessToken ?? null;
          if (token) {
            // apiClientWithAuth 호환을 위해 동기화
            localStorage.setItem("accessToken", token);
            useAuthStore.setState({ isLogin: true });
            // 앱 로드 시 프로필 정보 동기화
            const userId = state?.userId;
            if (userId) {
              useProfileStore.getState().fetchProfile(userId);
            }
          } else {
            useAuthStore.getState().setLogout();
          }
        });
      },

      // (선택) 스키마 변경 시 마이그레이션 예시
      // version: 1,
      // migrate: (persistedState: any, version) => {
      //   return persistedState as AuthState;
      // },
    }
  )
);

// 유틸리티 셀렉터 
export const selectIsLogin = (s: AuthState) => s.isLogin;
export const selectAccessToken = (s: AuthState) => s.accessToken;
export const selectUserId = (s: AuthState) => s.userId;

export const selectSetLogin = (s: AuthState) => s.setLogin;
export const selectSetLogout = (s: AuthState) => s.setLogout;

export const selectLogin = (s: AuthState) => s.login;
export const selectLogout = (s: AuthState) => s.logout;
export const selectReissue = (s: AuthState) => s.reissue;
export const selectInit = (s: AuthState) => s.init;
