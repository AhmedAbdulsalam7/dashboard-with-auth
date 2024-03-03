import Form from '@/app/ui/users/edit-form';
import Breadcrumbs from '@/app/ui/users/breadcrumbs';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';


const fetchUserById = async (id: string) => {
    const userById = await prisma.user.findUnique({
        where: {
            id
        }
    })
    return userById
}
 
export default async function Page({ params }: { params: { id: string } }) {
    const id = params.id;

    const [user] = await Promise.all([
        fetchUserById(id),
      ]);

      if (!user) {
        notFound();
      }
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Users', href: '/dashboard/users' },
          {
            label: 'Edit User',
            href: `/dashboard/users/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form user={user} />
    </main>
  );
}