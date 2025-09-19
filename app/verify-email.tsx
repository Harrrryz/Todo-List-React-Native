import { useSession } from '@/components/ctx';
import { VerificationSuccess } from '@/components/EmailVerification';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { router, useLocalSearchParams } from 'expo-router';
import { AlertTriangle, Loader2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function VerifyEmail() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const { verifyUserEmail } = useSession();
  const [verificationState, setVerificationState] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) {
      handleEmailVerification(token);
    } else {
      // If no token, redirect to sign-in
      router.replace('/sign-in');
    }
  }, [token]);

  const handleEmailVerification = async (verificationToken: string) => {
    try {
      setVerificationState('loading');
      const result = await verifyUserEmail(verificationToken);
      
      if (result.success) {
        setVerificationState('success');
        setMessage(result.message);
      } else {
        setVerificationState('error');
        setMessage(result.message);
      }
    } catch (error) {
      console.error('Email verification error:', error);
      setVerificationState('error');
      setMessage('An unexpected error occurred during verification.');
    }
  };

  const handleContinueToLogin = () => {
    router.replace('/sign-in');
  };

  if (verificationState === 'loading') {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Loader2 size={48} color="#007AFF" />
          <Text style={styles.loadingText}>Verifying your email...</Text>
        </View>
      </View>
    );
  }

  if (verificationState === 'success') {
    return <VerificationSuccess onContinueToLogin={handleContinueToLogin} />;
  }

  if (verificationState === 'error') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Email Verification</Text>
        
        <Alert icon={AlertTriangle} variant='destructive' className='max-w-xl mb-4'>
          <AlertTitle>Verification Failed</AlertTitle>
          <AlertDescription>
            {message}
          </AlertDescription>
        </Alert>

        <Text style={styles.helpText}>
          If you&apos;re having trouble, you can try requesting a new verification email from the sign-up page.
        </Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  helpText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
    lineHeight: 20,
  },
});