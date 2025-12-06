"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "./user-context";
import { updateUserRole } from "@/lib/supabase/services/users";

export type UserRole = "hunter" | "sponsor";

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  toggleRole: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { user, refreshUser } = useUser();
  const [role, setRoleState] = useState<UserRole>("hunter");

  useEffect(() => {
    if (user?.role) {
      setRoleState(user.role as UserRole);
    } else {
      const savedRole = localStorage.getItem("userRole") as UserRole;
      if (savedRole && (savedRole === "hunter" || savedRole === "sponsor")) {
        setRoleState(savedRole);
      }
    }
  }, [user]);

  const setRole = async (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem("userRole", newRole);

    if (user?.id) {
      try {
        await updateUserRole(user.id, newRole);
        await refreshUser();
      } catch (error) {
      }
    }
  };

  const toggleRole = () => {
    const newRole = role === "hunter" ? "sponsor" : "hunter";
    setRole(newRole);
  };

  return (
    <RoleContext.Provider value={{ role, setRole, toggleRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
