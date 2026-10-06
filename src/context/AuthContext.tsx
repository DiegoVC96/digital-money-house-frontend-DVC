"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const SESSION_STORAGE_KEY = "dmh.session.token";

interface AuthContextValue {
  token: string | null;
  pendingEmail: string | null;
  isRecoveryFlowActive: boolean;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  startSession: (token: string) => void;
  endSession: () => void;
  setPendingEmail: (email: string) => void;
  clearPendingEmail: () => void;
  startRecoveryFlow: () => void;
  endRecoveryFlow: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [pendingEmail, setPendingEmailState] = useState<string | null>(null);
  const [isRecoveryFlowActive, setIsRecoveryFlowActive] = useState(false);

  useEffect(() => {
    const storedToken = window.localStorage.getItem(SESSION_STORAGE_KEY);

    if (storedToken) {
      setToken(storedToken);
    }

    setIsAuthReady(true);
  }, []);

  const startSession = useCallback((newToken: string) => {
    const normalizedToken = newToken.trim();

    if (!normalizedToken) {
      return;
    }

    window.localStorage.setItem(SESSION_STORAGE_KEY, normalizedToken);
    setToken(normalizedToken);
  }, []);

  const endSession = useCallback(() => {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    setToken(null);
    setPendingEmailState(null);
    setIsRecoveryFlowActive(false);
  }, []);

  const setPendingEmail = useCallback((email: string) => {
    setPendingEmailState(email);
  }, []);

  const clearPendingEmail = useCallback(() => {
    setPendingEmailState(null);
  }, []);

  const startRecoveryFlow = useCallback(() => {
    setIsRecoveryFlowActive(true);
  }, []);

  const endRecoveryFlow = useCallback(() => {
    setIsRecoveryFlowActive(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      pendingEmail,
      isRecoveryFlowActive,
      isAuthenticated: token !== null,
      isAuthReady,
      startSession,
      endSession,
      setPendingEmail,
      clearPendingEmail,
      startRecoveryFlow,
      endRecoveryFlow,
    }),
    [
      token,
      pendingEmail,
      isRecoveryFlowActive,
      isAuthReady,
      startSession,
      endSession,
      setPendingEmail,
      clearPendingEmail,
      startRecoveryFlow,
      endRecoveryFlow,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de AuthProvider.");
  }

  return context;
}
