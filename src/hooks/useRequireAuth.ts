"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

interface RequiredAuth {
  token: string | null;
  isReady: boolean;
}

export function useRequireAuth(): RequiredAuth {
  const router = useRouter();
  const { token, isAuthenticated, isAuthReady } = useAuth();

  useEffect(() => {
    if (isAuthReady && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthReady, isAuthenticated, router]);

  return {
    token,
    isReady: isAuthReady && isAuthenticated,
  };
}
