
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, name: string, phone: string) => Promise<any>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  userRole: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Secure admin check using database role
  const isAdmin = userRole === 'admin';

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Defer profile and role fetching to prevent deadlocks
        setTimeout(() => {
          fetchProfile(session.user.id);
          fetchUserRole(session.user.id);
        }, 0);
      } else {
        setProfile(null);
        setUserRole(null);
        setLoading(false);
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchUserRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      } else if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user role:', error);
        setUserRole('user'); // Default to user role
      } else if (data) {
        setUserRole(data.role);
      } else {
        setUserRole('user'); // Default to user role
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole('user'); // Default to user role
    } finally {
      setLoading(false);
    }
  };

  // Clean up auth state utility
  const cleanupAuthState = () => {
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    // Remove from sessionStorage if in use
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Clean up any existing auth state
      cleanupAuthState();
      await supabase.auth.signOut();
    } catch (err) {
      // Continue even if this fails
    }

    // Input validation
    if (!email || !password) {
      return { data: null, error: { message: 'Email e senha são obrigatórios' } };
    }

    if (!email.includes('@')) {
      return { data: null, error: { message: 'Email inválido' } };
    }

    if (password.length < 6) {
      return { data: null, error: { message: 'Senha deve ter pelo menos 6 caracteres' } };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    return { data, error };
  };

  const signUp = async (email: string, password: string, name: string, phoneOrEmail: string) => {
    try {
      // Clean up any existing auth state
      cleanupAuthState();
      await supabase.auth.signOut();
    } catch (err) {
      // Continue even if this fails
    }

    // Input validation
    if (!email || !password || !name || !phoneOrEmail) {
      return { data: null, error: { message: 'Todos os campos são obrigatórios' } };
    }

    if (!email.includes('@')) {
      return { data: null, error: { message: 'Email inválido' } };
    }

    if (password.length < 6) {
      return { data: null, error: { message: 'Senha deve ter pelo menos 6 caracteres' } };
    }

    if (name.trim().length < 2) {
      return { data: null, error: { message: 'Nome deve ter pelo menos 2 caracteres' } };
    }

    const redirectUrl = `${window.location.origin}/`;
    
    // Determine if phoneOrEmail is a phone number or email
    const isPhone = phoneOrEmail.includes('(') && phoneOrEmail.includes(')');
    
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name: name.trim(),
          phone: isPhone ? phoneOrEmail : null,
          email: !isPhone ? phoneOrEmail : null,
          email_confirm: true // Auto-confirm to bypass email verification
        }
      }
    });

    if (data.user && !error) {
      // Create profile with appropriate data
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            name: name.trim(),
            phone: isPhone ? phoneOrEmail : null,
          },
        ]);

      if (profileError) {
        console.error('Error creating profile:', profileError);
      }
    }

    return { data, error };
  };

  const signOut = async () => {
    try {
      cleanupAuthState();
      await supabase.auth.signOut({ scope: 'global' });
      // Force page reload for clean state
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      // Force reload even if signout fails
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      isAdmin,
      userRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
