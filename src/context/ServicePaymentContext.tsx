"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type PaymentMethod =
  | { type: "balance" }
  | { type: "card"; cardId: number };

interface ServicePaymentDraft {
  serviceId: string;
  accountNumber: string;
  amount: number;
  paymentMethod?: PaymentMethod;
}

interface ServicePaymentContextValue {
  paymentDraft: ServicePaymentDraft | null;
  savePaymentDraft: (draft: ServicePaymentDraft) => void;
  clearPaymentDraft: () => void;
}

const ServicePaymentContext =
  createContext<ServicePaymentContextValue | null>(null);

export function ServicePaymentProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [paymentDraft, setPaymentDraft] =
    useState<ServicePaymentDraft | null>(null);

  const savePaymentDraft = useCallback((draft: ServicePaymentDraft) => {
    setPaymentDraft(draft);
  }, []);

  const clearPaymentDraft = useCallback(() => {
    setPaymentDraft(null);
  }, []);

  const value = useMemo(
    () => ({
      paymentDraft,
      savePaymentDraft,
      clearPaymentDraft,
    }),
    [clearPaymentDraft, paymentDraft, savePaymentDraft]
  );

  return (
    <ServicePaymentContext.Provider value={value}>
      {children}
    </ServicePaymentContext.Provider>
  );
}

export function useServicePayment(): ServicePaymentContextValue {
  const context = useContext(ServicePaymentContext);

  if (!context) {
    throw new Error(
      "useServicePayment debe utilizarse dentro de ServicePaymentProvider."
    );
  }

  return context;
}