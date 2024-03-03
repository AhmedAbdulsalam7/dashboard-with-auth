import { Card } from '@/app/ui/dashboard/cards';
import RevenueChart from '@/app/ui/dashboard/revenue-chart';
import LatestUsers from '@/app/ui/dashboard/latest-users';
import { lusitana } from '@/app/ui/fonts';
import prisma from '@/lib/prisma';
import { unstable_noStore as noStore } from 'next/cache';
import {auth} from '@/auth'
import YourChartComponent from '@/app/ui/dashboard/doughnut';

const revenue = [
  { month: 'Jan', revenue: 2000 },
  { month: 'Feb', revenue: 1800 },
  { month: 'Mar', revenue: 2200 },
  { month: 'Apr', revenue: 2500 },
  { month: 'May', revenue: 2300 },
  { month: 'Jun', revenue: 3200 },
  { month: 'Jul', revenue: 3500 },
  { month: 'Aug', revenue: 3700 },
  { month: 'Sep', revenue: 2500 },
  { month: 'Oct', revenue: 2800 },
  { month: 'Nov', revenue: 3000 },
  { month: 'Dec', revenue: 4800 },
];
 
export default async function Page() {


  const session = await auth()
  noStore();

  const result = await prisma.user.findMany({
    select: {
          name: true,
          email: true
        },
    orderBy: {
      createdAt: 'desc',
    },
    take: 7,
  });

  const users = await prisma.user.findMany();
  const countUser = await prisma.user.count();
  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <h3>{JSON.stringify(session)}</h3>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Requests" value={77} type="requests" />
        <Card title="Admin" value={34} type="admins" />
        <Card title="Total Users" value={190} type="users" />
        <Card
          title="Total Customers"
          value={200}
          type="customers"
        />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        {/* <RevenueChart revenue={revenue}  /> */}
        <YourChartComponent />
        <LatestUsers latestUsers={result} />
      </div>
    </main>
  );
}