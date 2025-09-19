import { accountLogin, AccountLogin, accountRegister, AccountRegister, accountProfile, resendVerification, verifyEmail, User } from '@/client';
import { useStorageState } from '@/hooks/useStorageState';
import { useRouter } from 'expo-router';
import { createContext, use, type PropsWithChildren } from 'react';

interface SignUpResult {
  success: boolean;
  requiresVerification?: boolean;
  user?: User;
  email?: string;
}

interface SignInResult {
  success: boolean;
  requiresVerification?: boolean;
  email?: string;
  error?: string;
}

const AuthContext = createContext<{
  signIn: (data: AccountLogin) => Promise<SignInResult>;
  signUp: (data: AccountRegister) => Promise<SignUpResult>;
  signOut: () => void;
  resendVerificationEmail: (email: string) => Promise<{ success: boolean; message: string }>;
  verifyUserEmail: (token: string) => Promise<{ success: boolean; message: string }>;
  getCurrentUser: () => Promise<User | null>;
  session?: string | null;
  isLoading: boolean;
}>({
  signIn: () => Promise.resolve({ success: false }),
  signUp: () => Promise.resolve({ success: false }),
  signOut: () => null,
  resendVerificationEmail: () => Promise.resolve({ success: false, message: '' }),
  verifyUserEmail: () => Promise.resolve({ success: false, message: '' }),
  getCurrentUser: () => Promise.resolve(null),
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

  const signIn = async (data: AccountLogin): Promise<SignInResult> => {
    // if data.username is not email, throw error
    if (!data.username || !data.password) {
      throw new NormalAuthError('Username and password are required');
    }
    if (!data.username.includes('@')) {
      throw new NormalAuthError('Username must be an email address');
    }

    try {
      const response = await accountLogin({
        body: { ...data },
      });
      console.log('Login response:', response);
      
      if (response.data && response.data.access_token) {
        setSession(response.data.access_token);
        router.push('/');
        return { success: true };
      } else {
        console.error('Login failed:', response.error);
        
        // Check if it's a 403 error (could be unverified user)
        if (response.error && typeof response.error === 'object' && 'status' in response.error && response.error.status === 403) {
          // Try to get current user info to check verification status
          try {
            const userResponse = await accountProfile();
            if (userResponse.data && !userResponse.data.is_verified) {
              return {
                success: false,
                error: 'Please verify your email before logging in',
                requiresVerification: true,
                email: userResponse.data.email
              };
            }
          } catch (userError) {
            console.log('Could not get user info:', userError);
          }
        }
        
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
    } catch (error) {
      if (error instanceof NormalAuthError || error instanceof OtherAuthError) {
        throw error;
      }
      console.error('Unexpected login error:', error);
      throw new NormalAuthError('An unexpected error occurred during login');
    }
  };

  const signUp = async (data: AccountRegister): Promise<SignUpResult> => {
    // Validate required fields
    if (!data.email || !data.password) {
      throw new NormalAuthError('Email and password are required');
    }
    if (!data.email.includes('@')) {
      throw new NormalAuthError('Email must be a valid email address');
    }

    try {
      const response = await accountRegister({
        body: { ...data },
      });
      console.log('Sign-up response:', response);
      
      if (response.data && response.data.id) {
        const user = response.data;
        
        // Check if user needs email verification
        if (!user.is_verified) {
          return {
            success: true,
            requiresVerification: true,
            user,
            email: user.email
          };
        }
        
        // If user is already verified (shouldn't happen with new flow, but just in case)
        // Auto-login the user
        const loginData: AccountLogin = {
          username: data.email,
          password: data.password,
        };
        await signIn(loginData);
        return { success: true, user };
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
    } catch (error) {
      if (error instanceof NormalAuthError || error instanceof OtherAuthError) {
        throw error;
      }
      console.error('Unexpected signup error:', error);
      throw new NormalAuthError('An unexpected error occurred during sign-up');
    }
  };

  const resendVerificationEmail = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await resendVerification({
        query: { email },
      });
      
      if (response.data) {
        return {
          success: true,
          message: 'Verification email sent successfully!'
        };
      } else {
        return {
          success: false,
          message: 'Failed to send verification email. Please try again.'
        };
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      return {
        success: false,
        message: 'Failed to send verification email. Please try again.'
      };
    }
  };

  const verifyUserEmail = async (token: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await verifyEmail({
        query: { token },
      });
      
      if (response.data) {
        return {
          success: true,
          message: 'Email verified successfully! You can now log in.'
        };
      } else {
        return {
          success: false,
          message: 'Invalid or expired verification token.'
        };
      }
    } catch (error) {
      console.error('Email verification error:', error);
      return {
        success: false,
        message: 'Failed to verify email. The token may be invalid or expired.'
      };
    }
  };

  const getCurrentUser = async (): Promise<User | null> => {
    try {
      if (!session) {
        return null;
      }
      
      const response = await accountProfile();
      if (response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
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
        resendVerificationEmail,
        verifyUserEmail,
        getCurrentUser,
        session,
        isLoading,
      }}>
      {children}
    </AuthContext>
  );
}
