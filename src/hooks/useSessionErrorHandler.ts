"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { isUnauthorizedError } from "../services/api";
import { useAuth } from "../context/AuthContext";

export function useSessionErrorHandler() {
  const router = useRouter();
  const { endSession } = useAuth();

  return useCallback(
    (error: unknown): boolean => {
      if (!isUnauthorizedError(error)) {
        return false;
      }

      endSession();
      router.replace("/login");

      return true;
    },
    [endSession, router]
  );
}