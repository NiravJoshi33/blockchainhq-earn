"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { getUserByPrivyId, createUser } from "@/lib/supabase/services/users";
import { supabase } from "@/lib/supabase/client";
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

      if (!dbUser) {
        dbUser = await createUser({
          privy_id: privyUser.id,
          email: privyUser.email?.address,
          wallet_address: privyUser.wallet?.address,
        });
      } else {
        if (!dbUser.name || !dbUser.avatar_url) {
          const { generateRandomUsername, generateAvatarUrl } = await import("@/lib/utils");
          
          const updates: { name?: string; avatar_url?: string } = {};
          
          if (!dbUser.name) {
            const randomUsername = generateRandomUsername();
            updates.name = randomUsername
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");
          }
          
          if (!dbUser.avatar_url) {
            updates.avatar_url = generateAvatarUrl(
              dbUser.name || dbUser.email || undefined
            );
          }
          
          if (Object.keys(updates).length > 0) {
            const { data: updatedUser, error: updateError } = await supabase
              .from("users")
              .update(updates)
              .eq("id", dbUser.id)
              .select()
              .single();
            
            if (!updateError && updatedUser) {
              dbUser = updatedUser;
            }
          }
        }
      }

      setUser(dbUser);
    } catch (error) {
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
