import { NormalAuthError, useSession } from '@/components/ctx';
import { VerificationPending } from '@/components/EmailVerification';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { router } from 'expo-router';
import { AlertTriangle } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showVerificationPending, setShowVerificationPending] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const { signUp } = useSession();

  const handleSignUp = async () => {
    // Basic validation
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    const AccountRegisterData = {
      email: email,
      password: password,
      name: name || null,
    };

    try {
      const result = await signUp(AccountRegisterData);
      
      if (result.success && result.requiresVerification) {
        // Show verification pending screen
        setVerificationEmail(result.email || email);
        setShowVerificationPending(true);
        setError(null);
      } else if (result.success) {
        // User was logged in (shouldn't happen with new flow, but just in case)
        router.replace('/');
      }
    } catch (error) {
      if (error instanceof NormalAuthError) {
        console.error('Sign-up error:', error.message);
        setError(error.message);
      } else {
        console.error('Unexpected error during sign-up:', error);
        setError('An unexpected error occurred. Please try again later.');
      }
    }
  };

  const handleBackToSignIn = () => {
    router.back();
  };

  const handleBackToSignInFromVerification = () => {
    setShowVerificationPending(false);
    router.replace('/sign-in');
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
      <Text style={styles.title}>Sign Up</Text>

      <TextInput
        style={styles.input}
        placeholder="Email *"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Name (Optional)"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />

      <TextInput
        style={styles.input}
        placeholder="Password *"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm Password *"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkButton} onPress={handleBackToSignIn}>
        <Text style={styles.linkText}>Already have an account? Sign In</Text>
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
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});