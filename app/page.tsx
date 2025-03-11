import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to login page
  redirect('/login');
  
  // This code below won't execute due to the redirect
  return null;
}
