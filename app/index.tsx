import { useSession } from '@/components/ctx';
import { Redirect } from 'expo-router';


export default function HomeScreen() {

  const { session } = useSession();

  if (!session) {
    return <Redirect href="/sign-in" />;
  }

  return <Redirect href="/home" />;
} 