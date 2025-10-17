import { useSession } from '@/components/ctx';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { router, useLocalSearchParams } from 'expo-router';
import { AlertTriangle, CheckCircle, Lock } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ResetPassword() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useSession();

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please check your email link.');
    }
  }, [token]);

  const handleResetPassword = async () => {
    // Validation
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (!token) {
      setError('Invalid reset token');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await resetPassword(token, newPassword);
      
      if (result.success) {
        setSuccess(true);
        // Redirect to sign-in after a delay
        setTimeout(() => {
          router.replace('/sign-in');
        }, 3000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    router.replace('/sign-in');
  };

  if (success) {
    return (
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <CheckCircle size={64} color="#22C55E" />
        </View>

        <Text style={styles.title}>✅ Password Reset Successfully!</Text>

        <Text style={styles.description}>
          Your password has been reset successfully. You can now log in with your new password.
        </Text>

        <Text style={styles.redirectText}>
          Redirecting to sign in page in 3 seconds...
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={handleBackToSignIn}
        >
          <Text style={styles.buttonText}>Go to Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Lock size={64} color="#007AFF" />
      </View>

      <Text style={styles.title}>🔐 Reset Your Password</Text>

      <Text style={styles.description}>
        Enter your new password below. Make sure it&apos;s strong and secure.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="New Password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm New Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleResetPassword}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Resetting Password...' : 'Reset Password'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={handleBackToSignIn}
      >
        <Text style={styles.linkText}>Back to Sign In</Text>
      </TouchableOpacity>

      {error && (
        <Alert icon={AlertTriangle} variant='destructive' className='max-w-xl mt-3'>
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  description: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    color: '#666',
    lineHeight: 22,
  },
  redirectText: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 15,
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    alignItems: 'center',
    padding: 10,
    marginBottom: 15,
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});