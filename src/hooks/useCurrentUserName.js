"use client";

import { useEffect, useState } from "react";
import { getAccount, getUser } from "../services/accountService";
import { useSessionErrorHandler } from "./useSessionErrorHandler";

const DEFAULT_USER_NAME = "usuario";

function getFullName(user) {
  if (!user) {
    return DEFAULT_USER_NAME;
  }

  const fullName = `${user.firstname || ""} ${user.lastname || ""}`.trim();
  return fullName || user.fullname || DEFAULT_USER_NAME;
}

/** Obtiene solo el nombre de presentación durante la sesión actual. */
export function useCurrentUserName(token, isReady) {
  const handleSessionError = useSessionErrorHandler();
  const [userName, setUserName] = useState(DEFAULT_USER_NAME);

  useEffect(() => {
    if (!isReady || !token) {
      return;
    }

    let isMounted = true;

    async function loadUserName() {
      try {
        const account = await getAccount(token);
        const user = await getUser(token, account.user_id);

        if (isMounted) {
          setUserName(getFullName(user));
        }
      } catch (error) {
        handleSessionError(error);
      }
    }

    loadUserName();

    return () => {
      isMounted = false;
    };
  }, [handleSessionError, isReady, token]);

  return userName;
}
