import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, Profile } from '@/lib/supabase';
import type { AuthResponse, AuthError } from '@supabase/supabase-js';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ data: AuthResponse['data']; error: AuthError | null }>;
  signUp: (email: string, password: string, name: string, phone: string) => Promise<{ data: AuthResponse['data']; error: AuthError | null }>;
  signUpBarbershop: (email: string, password: string, barbershopData: any) => Promise<{ data: AuthResponse['data']; error: AuthError | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isBarbershop: boolean;
  userRole: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Role checks using database role
  const isAdmin = userRole === 'admin';
  const isBarbershop = userRole === 'barbershop';

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
      // Create profile for auth relationship
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            name: name.trim(),
            phone: phoneOrEmail, // Sempre salvar o telefone
          },
        ]);

      if (profileError) {
        console.error('Error creating profile:', profileError);
      }

      // ✅ SALVAR NA TABELA CLIENTS (principal)
      // Verificar se já existe cliente com mesmo nome ou telefone
      const { data: existingClient, error: searchError } = await supabase
        .from('clients')
        .select('id')
        .or(`name.eq."${name.trim()}",phone.eq."${phoneOrEmail}"`)
        .maybeSingle();

      if (searchError && searchError.code !== 'PGRST116') {
        console.error('Error searching existing client:', searchError);
      }

      if (!existingClient) {
        // Só criar se não existe cliente com mesmo nome/telefone
        const { error: clientError } = await supabase
          .from('clients')
          .insert([
            {
              name: name.trim(),
              phone: phoneOrEmail,
              cpf: '', // CPF agora é opcional
              accepts_whatsapp: true,
              status: 'active'
            },
          ]);

        if (clientError) {
          console.error('Error creating client:', clientError);
        } else {
          console.log('✅ New client created for authenticated user');
        }
      } else {
        console.log('✅ Client already exists, skipping creation');
      }
    }

    return { data, error };
  };

  const signUpBarbershop = async (email: string, password: string, barbershopData: any) => {
    try {
      // Clean up any existing auth state
      cleanupAuthState();
      await supabase.auth.signOut();
    } catch (err) {
      // Continue even if this fails
    }

    // Input validation
    if (!email || !password || !barbershopData.barbershopName || !barbershopData.ownerName) {
      return { data: null, error: { message: 'Todos os campos obrigatórios devem ser preenchidos' } };
    }

    if (!email.includes('@')) {
      return { data: null, error: { message: 'Email inválido' } };
    }

    if (password.length < 6) {
      return { data: null, error: { message: 'Senha deve ter pelo menos 6 caracteres' } };
    }

    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name: barbershopData.ownerName.trim(),
          phone: barbershopData.phone,
          email_confirm: true // Auto-confirm to bypass email verification
        }
      }
    });

    if (data.user && !error) {
      // Create profile for auth relationship
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            name: barbershopData.ownerName.trim(),
            phone: barbershopData.phone,
          },
        ]);

      if (profileError) {
        console.error('Error creating profile:', profileError);
      }

      // Create barbershop using the function
      const { data: barbershopResult, error: barbershopError } = await supabase
        .rpc('create_barbershop_with_defaults', {
          barbershop_name: barbershopData.barbershopName,
          owner_name: barbershopData.ownerName,
          email: email.trim().toLowerCase(),
          phone: barbershopData.phone || null,
          address: barbershopData.address || null,
          city: barbershopData.city || null,
          state: barbershopData.state || null,
          zip_code: barbershopData.zipCode || null,
          plan_id: barbershopData.selectedPlan || 'basic'
        });

      if (barbershopError) {
        console.error('Error creating barbershop:', barbershopError);
        return { data: null, error: { message: 'Erro ao criar barbearia' } };
      }

      // Link user to barbershop
      const { error: linkError } = await supabase
        .from('barbershop_users')
        .insert([
          {
            user_id: data.user.id,
            barbershop_id: barbershopResult,
            role: 'owner'
          },
        ]);

      if (linkError) {
        console.error('Error linking user to barbershop:', linkError);
      }

      // Set user role as barbershop
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([
          {
            user_id: data.user.id,
            role: 'barbershop'
          },
        ]);

      if (roleError) {
        console.error('Error setting user role:', roleError);
      }

      console.log('✅ Barbershop created successfully');
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
      signUpBarbershop,
      signOut,
      isAdmin,
      isBarbershop,
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
