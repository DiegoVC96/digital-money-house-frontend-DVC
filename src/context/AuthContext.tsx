"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface AuthContextValue {
  token: string | null;
  pendingEmail: string | null;
  isRecoveryFlowActive: boolean;
  isAuthenticated: boolean;
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
  const [pendingEmail, setPendingEmailState] = useState<string | null>(null);
  const [isRecoveryFlowActive, setIsRecoveryFlowActive] = useState(false);

  const startSession = useCallback((newToken: string) => {
    setToken(newToken);
  }, []);

  const endSession = useCallback(() => {
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