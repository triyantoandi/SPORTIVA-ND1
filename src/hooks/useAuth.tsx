import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, UserRole } from "../types";
import { AuthService } from "../firebase/services/authService";

interface AuthContextType {
  user: UserProfile;
  role: UserRole;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginGoogle: () => Promise<void>;
  register: (email: string, pass: string, fullName: string, username: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (newRole: UserRole) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(AuthService.getStoredUser());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initial fetch of profile
    const current = AuthService.getStoredUser();
    setUser(current);
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const u = await AuthService.loginWithEmail(email, pass);
      setUser(u);
    } finally {
      setIsLoading(false);
    }
  };

  const loginGoogle = async () => {
    setIsLoading(true);
    try {
      const u = await AuthService.loginWithGoogle();
      setUser(u);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, pass: string, fullName: string, username: string) => {
    setIsLoading(true);
    try {
      const u = await AuthService.registerWithEmail(email, pass, fullName, username);
      setUser(u);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      await AuthService.resetPassword(email);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await AuthService.logout();
    const stored = AuthService.getStoredUser();
    setUser(stored);
  };

  const switchRole = async (newRole: UserRole) => {
    const updated = await AuthService.switchRole(newRole);
    setUser(updated);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const updated = await AuthService.updateUserProfile(updates);
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user.role,
        isLoading,
        login,
        loginGoogle,
        register,
        resetPassword,
        logout,
        switchRole,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
