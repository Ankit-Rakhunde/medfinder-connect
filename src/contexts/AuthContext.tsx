
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

interface AuthUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

// Define the type for the response from the authenticate_user and register_user functions
interface AuthResponse {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

// Define the parameter types for the RPC functions
interface AuthenticateParams {
  email_input: string;
  password_input: string;
}

interface RegisterParams {
  email_input: string;
  password_input: string;
  first_name_input: string;
  last_name_input: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on initial load
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Error parsing stored user:", err);
        localStorage.removeItem("auth_user");
      }
    }
    setLoading(false);

    // Listen for auth state changes
    window.addEventListener("auth_state_change", () => {
      const currentUser = localStorage.getItem("auth_user");
      if (currentUser) {
        try {
          setUser(JSON.parse(currentUser));
        } catch (err) {
          console.error("Error parsing stored user:", err);
        }
      } else {
        setUser(null);
      }
    });

    return () => {
      window.removeEventListener("auth_state_change", () => {});
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.rpc<AuthResponse, AuthenticateParams>('authenticate_user', {
        email_input: email,
        password_input: password
      });

      if (error) throw error;
      if (!data) throw new Error("Authentication failed");
      
      // Cast the data to AuthResponse to ensure type safety
      const authData = data as unknown as AuthResponse;

      const userData = {
        id: authData.id,
        email: authData.email,
        first_name: authData.first_name,
        last_name: authData.last_name
      };

      // Store user in localStorage
      localStorage.setItem("auth_user", JSON.stringify(userData));
      setUser(userData);

      // Dispatch event to update auth state
      window.dispatchEvent(new Event("auth_state_change"));
      
      return { error: null };
    } catch (error: any) {
      console.error("Error signing in:", error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const { data, error } = await supabase.rpc<AuthResponse, RegisterParams>('register_user', {
        email_input: email,
        password_input: password,
        first_name_input: firstName,
        last_name_input: lastName
      });

      if (error) throw error;
      
      // On successful registration, automatically sign in
      if (data) {
        // Cast the data to AuthResponse to ensure type safety
        const authData = data as unknown as AuthResponse;
        
        const userData = {
          id: authData.id,
          email: authData.email,
          first_name: authData.first_name,
          last_name: authData.last_name
        };

        localStorage.setItem("auth_user", JSON.stringify(userData));
        setUser(userData);
        
        // Dispatch event to update auth state
        window.dispatchEvent(new Event("auth_state_change"));
      }
      
      return { error: null };
    } catch (error: any) {
      console.error("Error signing up:", error);
      return { error };
    }
  };

  const signOut = async () => {
    // Remove user from localStorage
    localStorage.removeItem("auth_user");
    setUser(null);
    
    // Dispatch event to update auth state
    window.dispatchEvent(new Event("auth_state_change"));
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
