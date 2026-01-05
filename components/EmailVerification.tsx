import { useSession } from '@/components/ctx';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { router } from 'expo-router';
import { AlertTriangle, CheckCircle, Mail } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface VerificationPendingProps {
  email: string;
  onBackToSignIn?: () => void;
}

export const VerificationPending: React.FC<VerificationPendingProps> = ({
  email,
  onBackToSignIn
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Mail size={64} color="#007AFF" />
      </View>

      <Text style={styles.title}>📧 Check Your Email</Text>

      <Text style={styles.description}>
        We&apos;ve sent a verification link to{'\n'}
        <Text style={styles.email}>{email}</Text>
      </Text>

      <Text style={styles.instructions}>
        Please click the link in the email to verify your account.
      </Text>

      <ResendVerificationButton email={email} />

      {onBackToSignIn && (
        <TouchableOpacity
          style={styles.linkButton}
          onPress={onBackToSignIn}
        >
          <Text style={styles.linkText}>Back to Sign In</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

interface ResendVerificationButtonProps {
  email: string;
}

export const ResendVerificationButton: React.FC<ResendVerificationButtonProps> = ({
  email
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
  const { resendVerificationEmail } = useSession();

  const handleResendVerification = async () => {
    setIsLoading(true);
    setMessage('');
    setMessageType(null);

    try {
      const result = await resendVerificationEmail(email);

      if (result.success) {
        setMessage(result.message);
        setMessageType('success');
      } else {
        setMessage(result.message);
        setMessageType('error');
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      setMessage('Failed to send email. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.resendContainer}>
      <TouchableOpacity
        style={[styles.resendButton, isLoading && styles.disabledButton]}
        onPress={handleResendVerification}
        disabled={isLoading}
      >
        <Text style={styles.resendButtonText}>
          {isLoading ? 'Sending...' : 'Resend Verification Email'}
        </Text>
      </TouchableOpacity>

      {message && (
        <Alert
          icon={messageType === 'success' ? CheckCircle : AlertTriangle}
          variant={messageType === 'error' ? 'destructive' : 'default'}
          className='max-w-xl mt-3'
        >
          <AlertTitle>
            {messageType === 'success' ? 'Success!' : 'Error!'}
          </AlertTitle>
          <AlertDescription>
            {message}
          </AlertDescription>
        </Alert>
      )}
    </View>
  );
};

interface VerificationSuccessProps {
  onContinueToLogin?: () => void;
}

export const VerificationSuccess: React.FC<VerificationSuccessProps> = ({
  onContinueToLogin
}) => {
  const handleContinue = () => {
    if (onContinueToLogin) {
      onContinueToLogin();
    } else {
      router.replace('/sign-in');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <CheckCircle size={64} color="#34C759" />
      </View>

      <Text style={styles.title}>✅ Email Verified!</Text>

      <Text style={styles.description}>
        Your email has been successfully verified.{'\n'}
        You can now log in to your account.
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Continue to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
    lineHeight: 24,
  },
  email: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
  instructions: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    color: '#888',
    lineHeight: 20,
  },
  resendContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  resendButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  disabledButton: {
    opacity: 0.6,
  },
  resendButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    alignItems: 'center',
    padding: 10,
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});