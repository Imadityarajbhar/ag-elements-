import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getWpUserIdFromToken } from '@/lib/auth-helpers';
import { getDashboardData } from '@/services/account/accountService';
import DashboardClient from '@/features/account/components/DashboardClient';

export default async function AccountDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('ag_auth_token')?.value;

  if (!token) {
    redirect('/account/login?redirect=/account');
  }

  const baseUrl = process.env.NEXT_PUBLIC_WC_API_URL || '';
  
  let userId;
  try {
    userId = await getWpUserIdFromToken(token, baseUrl);
  } catch (error) {
    // If token is invalid or expired
    redirect('/account/login?redirect=/account');
  }

  let dashboardData;
  try {
    dashboardData = await getDashboardData(userId);
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
    // Render error state or empty state. For now, fallback to empty data.
    dashboardData = { user: null, orders: [], recommended: [] };
  }

  return (
    <DashboardClient initialData={dashboardData} />
  );
}
