import { accountLogin, AccountLogin } from '@/client';
import { useStorageState } from '@/hooks/useStorageState';
import { useRouter } from 'expo-router';
import { createContext, use, type PropsWithChildren } from 'react';

const AuthContext = createContext<{
  signIn: (data: AccountLogin) => Promise<void>;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
}>({
  signIn: () => Promise.resolve(),
  signOut: () => null,
  session: null,
  isLoading: false,
});

interface LoginError {
  status: number;
  title?: string;
  detail?: string;
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
        throw new NormalAuthError((response.error as unknown as LoginError).title || 'Login failed');
      } else {
        throw new OtherAuthError('Login failed', response.error as unknown as LoginError);
      }
    }
  };

  return (
    <AuthContext
      value={{
        signIn,
        signOut: () => {
          setSession(null);
        },
        session,
        isLoading,
      }}>
      {children}
    </AuthContext>
  );
}
