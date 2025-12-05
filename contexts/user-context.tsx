"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { getUserByPrivyId, createUser } from "@/lib/supabase/services/users";
import type { Database } from "@/lib/supabase/database.types";

type User = Database["public"]["Tables"]["users"]["Row"];

interface UserContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user: privyUser, authenticated } = usePrivy();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    if (!privyUser?.id) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      let dbUser = await getUserByPrivyId(privyUser.id);

      // Create user if doesn't exist
      if (!dbUser) {
        dbUser = await createUser({
          privy_id: privyUser.id,
          email: privyUser.email?.address,
          wallet_address: privyUser.wallet?.address,
        });
      }

      setUser(dbUser);
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated) {
      refreshUser();
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [authenticated, privyUser?.id]);

  return (
    <UserContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
}
