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
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  return {
    token,
    isReady: isAuthenticated,
  };
}