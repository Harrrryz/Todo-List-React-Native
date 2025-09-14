import { accountLogin, AccountLogin, accountRegister, AccountRegister } from '@/client';
import { useStorageState } from '@/hooks/useStorageState';
import { useRouter } from 'expo-router';
import { createContext, use, type PropsWithChildren } from 'react';

const AuthContext = createContext<{
  signIn: (data: AccountLogin) => Promise<void>;
  signUp: (data: AccountRegister) => Promise<void>;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
}>({
  signIn: () => Promise.resolve(),
  signUp: () => Promise.resolve(),
  signOut: () => null,
  session: null,
  isLoading: false,
});

interface LoginErrorMessage {
  message: string;
  key: string;
}

interface LoginError {
  status: number;
  title?: string;
  detail?: string;
  extra?: LoginErrorMessage[];
}

export class NormalAuthError extends Error {
  constructor(message: string, public error?: LoginError) {
    super(message);
    this.name = 'AuthError';
  }
}

export class OtherAuthError extends Error {
  constructor(message: string, public error?: LoginError) {
    super(message);
    this.name = 'OtherAuthError';
  }
}

// This hook can be used to access the user info.
export function useSession() {
  const value = use(AuthContext);
  if (!value) {
    throw new Error('useSession must be wrapped in a <SessionProvider />');
  }

  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState('session');
  const router = useRouter();

  const signIn = async (data: AccountLogin) => {
    // if data.username is not email, throw error
    if (!data.username || !data.password) {
      throw new NormalAuthError('Username and password are required');
    }
    if (!data.username.includes('@')) {
      throw new NormalAuthError('Username must be an email address');
    }

    const response = await accountLogin({
      body: { ...data },
    });
    console.log('Login response:', response);
    if (response.data && response.data.access_token) {
      setSession(response.data.access_token);
      router.push('/');
    } else {
      console.error('Login failed:', response.error);
      if ((response.error as unknown as LoginError).title) {
        let extraMessage = ''
        let extra = (response.error as unknown as LoginError).extra || [];
        if (extra.length > 0) {
          extraMessage = extra.map((e) => `${e.key}: ${e.message}`).join(', ');
        }
        // if has extraMessage only use it
        if (extraMessage) {
          throw new NormalAuthError(extraMessage || 'Login failed');
        }
        throw new NormalAuthError((response.error as unknown as LoginError).title || 'Login failed');
      } else {
        throw new OtherAuthError('Login failed', response.error as unknown as LoginError);
      }
    }
  };

  const signUp = async (data: AccountRegister) => {
    // Validate required fields
    if (!data.email || !data.password) {
      throw new NormalAuthError('Email and password are required');
    }
    if (!data.email.includes('@')) {
      throw new NormalAuthError('Email must be a valid email address');
    }

    const response = await accountRegister({
      body: { ...data },
    });
    console.log('Sign-up response:', response);
    if (response.data && response.data.id) {
      // After successful sign-up, automatically sign in the user
      const loginData: AccountLogin = {
        username: data.email,
        password: data.password,
      };
      await signIn(loginData);
    } else {
      console.error('Sign-up failed:', response.error);
      if ((response.error as unknown as LoginError).title) {
        let extraMessage = ''
        let extra = (response.error as unknown as LoginError).extra || [];
        if (extra.length > 0) {
          extraMessage = extra.map((e) => `${e.key}: ${e.message}`).join(', ');
        }
        // if has extraMessage only use it
        if (extraMessage) {
          throw new NormalAuthError(extraMessage || 'Sign-up failed');
        }
        throw new NormalAuthError((response.error as unknown as LoginError).title || 'Sign-up failed');
      } else {
        throw new OtherAuthError('Sign-up failed', response.error as unknown as LoginError);
      }
    }
  };

  return (
    <AuthContext
      value={{
        signIn,
        signUp,
        signOut: () => {
          setSession(null);
          // Force a redirect to sign-in after clearing session
          router.replace('/sign-in');
        },
        session,
        isLoading,
      }}>
      {children}
    </AuthContext>
  );
}
