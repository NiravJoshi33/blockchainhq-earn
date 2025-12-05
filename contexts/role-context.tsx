"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "hunter" | "sponsor";

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  toggleRole: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>("hunter");

  // Load role from localStorage on mount
  useEffect(() => {
    const savedRole = localStorage.getItem("userRole") as UserRole;
    if (savedRole && (savedRole === "hunter" || savedRole === "sponsor")) {
      setRoleState(savedRole);
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem("userRole", newRole);
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
