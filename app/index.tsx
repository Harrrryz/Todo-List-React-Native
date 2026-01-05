import { useSession } from '@/components/ctx';
import { Redirect } from 'expo-router';


export default function IndexScreen() {
  const { session, isLoading } = useSession();

  // Show nothing while loading session state
  if (isLoading) {
    return null;
  }

  // Redirect based on authentication status
  if (!session) {
    return <Redirect href="/sign-in" />;
  }

  return <Redirect href="/home" />;
} 