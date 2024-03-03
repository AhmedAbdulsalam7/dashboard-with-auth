'use server';

import { z } from 'zod';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth, signIn } from '@/auth';
import { AuthError } from 'next-auth';
import bcrypt from 'bcrypt';
 
const FormSchema = z.object({
  userName: z.string().refine((data) => !!data, {
    message: 'Please Enter the Name of User.',
  }),
  email: z.string().refine((data) => !!data, {
    message: 'Please Enter the Email of User.',
  }),
  password: z.string().refine((data) => !!data, {
    message: 'Please Enter the Password of User.',
  }),
  role: z.enum(['USER', 'ADMIN'], {invalid_type_error: 'Please select an Role for this user.',}),
});

export type State = {
  errors?: {
    userName?: string[];
    email?: string[];
    password?: string[];
    role?: string[];
  };
  message?: string | null;
};

const CreateUser = FormSchema;
const UpdateUser = FormSchema.omit({ id: true, date: true });
 
export async function createUser(prevState: State, formData: FormData) {

  const session = await auth();
    if (session?.user?.role === 'USER')
  throw new Error('Failed to Create User, please you are not allowed to Create users, contact with system administrator!');

    const validatedFields = CreateUser.safeParse({
      userName: formData.get('userName'),
      email: formData.get('email'),
      password: formData.get('password'),
      role: formData.get('role'),
    });

      // If form validation fails, return errors early. Otherwise, continue.
      console.log(validatedFields, 'validatedFields')
  if (!validatedFields.success) {
    console.log(validatedFields.error.flatten().fieldErrors, 'Errors')
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create User.',
    };
  }

  // Prepare data for insertion into the database
  const { userName, email, password, role } = validatedFields.data;

    const hashPassword : string = await bcrypt.hash(password, 10);

      const getUserByEmail = await prisma.user.findUnique({
        where: { email }
      })

      if (getUserByEmail) return null


      try {
        await prisma.user.create({
          data: {
              name: userName,
              email: email,
              password: hashPassword,
              role: role
            },
        });
      } catch (error) {
        return {
          message: 'Database Error: Failed to Create Users.',
        };
      }
      revalidatePath('/dashboard/users');
      redirect('/dashboard/users');
}


export async function updateUser(
  id: string,
  prevState: State,
  formData: FormData) {

    const session = await auth();

      if (session?.user?.role === 'USER')
    throw new Error('Failed to Edit User, please you are not allowed to Edit users, contact with system administrator!');

  
  const validatedFields = UpdateUser.safeParse({
    userName: formData.get('userName'),
    email: formData.get('email'),
    password: formData.get('password'),
    role: formData.get('role'),
  });

  

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update User.',
    };
  }

  console.log(validatedFields)
// Prepare data for insertion into the database
const { userName, email, password, role } = validatedFields.data;

if (validatedFields === null) return null;

console.log(validatedFields, 'validatedFields');

const userUpdate = <any> {
  name: userName,
  email,
  password,
  role
}

const oldUser = await prisma.user.findUnique({
  where: {
    id
  }
})


if (!userUpdate.name) {
  userUpdate.name= oldUser?.name
}
if (!userUpdate.email) {
  userUpdate.email= oldUser?.email
}

if (!userUpdate.password) {
  userUpdate.password= oldUser?.password
}

if (!userUpdate.role) {
  userUpdate.role= oldUser?.role
}


try {
  await prisma.user.update({
    where: {id},
    data: userUpdate
  });
} catch (error) {
  return { message: 'Database Error: Failed to Update User.' };
}
    revalidatePath('/dashboard/users');
    redirect('/dashboard/users');
}

export async function deleteUser(id: string) {

  const session = await auth();
  if (session?.user?.role === 'USER')
  throw new Error('Failed to Delete User, please you are not allowed to delete users, contact with system administrator!');

  try {
    await prisma.user.delete({
      where: {id}
    })
    revalidatePath('/dashboard/users');
    return { message: 'Deleted User.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete User.' };
  }
}






export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}