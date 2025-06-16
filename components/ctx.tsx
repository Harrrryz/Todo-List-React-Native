import { accountLogin, AccountLogin } from '@/client';
import { useStorageState } from '@/hooks/useStorageState';
import { createContext, use, type PropsWithChildren } from 'react';

const AuthContext = createContext<{
  signIn: (data: AccountLogin) => void;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
}>({
  signIn: () => null,
  signOut: () => null,
  session: null,
  isLoading: false,
});


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

  const signIn = async (data: AccountLogin) => {
    const response = await accountLogin({
      body: { ...data },
    });
    setSession(response.data?.access_token || null);
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
