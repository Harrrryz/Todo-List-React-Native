import { NormalAuthError, useSession } from '@/components/ctx';
import { VerificationPending } from '@/components/EmailVerification';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { router } from 'expo-router';
import { AlertTriangle } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Authorization() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showVerificationPending, setShowVerificationPending] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const { signIn } = useSession();

  const handleLogin = async () => {
    const AccountLoginData = {
      username: email,
      password: password,
    }
    try {
      const result = await signIn(AccountLoginData);
      
      if (result.success) {
        router.replace('/');
      } else if (result.requiresVerification) {
        // Show verification pending screen for unverified users
        setVerificationEmail(result.email || email);
        setShowVerificationPending(true);
        setError(null);
      } else if (result.error) {
        setError(result.error);
      }
    } catch (error) {
      if (error instanceof NormalAuthError) {
        console.error('Login error:', error.message);
        setError(error.message);
      } else {
        console.error('Unexpected error during login:', error);
        setError('An unexpected error occurred. Please try again later.');
      }
    }
  };

  const handleGoToSignUp = () => {
    router.push('/sign-up');
  };

  const handleBackToSignInFromVerification = () => {
    setShowVerificationPending(false);
    setError(null);
  };

  // Show verification pending screen if needed
  if (showVerificationPending) {
    return (
      <VerificationPending 
        email={verificationEmail}
        onBackToSignIn={handleBackToSignInFromVerification}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.commitText}>Commit</Text>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkButton} onPress={handleGoToSignUp}>
        <Text style={styles.linkText}>Don&apos;t have an account? Sign Up</Text>
      </TouchableOpacity>

      {error &&
        <Alert icon={AlertTriangle} variant='destructive' className='max-w-xl mt-3'>
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      }
    </View>
  );
}

const styles = StyleSheet.create({

  commitText: {
    fontSize: 40,
    fontWeight: 'bold',
    paddingBottom: 30,
    marginBottom: 20,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 15,
    padding: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
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