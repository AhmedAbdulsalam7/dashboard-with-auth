import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { string, z } from 'zod';
// import { sql } from '@vercel/postgres';
import type { User } from '@/app/lib/definitions';
import prisma from './lib/prisma';
import bcrypt from 'bcrypt';


async function getUser(email: string): Promise<User | undefined> {
    try {

    const user: any = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });
    if (user !== null)
    return user
    } catch (error) {
      console.error('Failed to fetch user:', error);
      throw new Error('Failed to fetch user.');
    }
  }
 
export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
        async authorize(credentials) {
          const parsedCredentials = z
            .object({ email: z.string().email(), password: z.string().min(6) })
            .safeParse(credentials);

            if (parsedCredentials.success) {
                const { email, password } = parsedCredentials.data;
                const user = await getUser(email);
                if (!user) return null; // null value that mean stay in the login page...
                const passwordsMatch = await bcrypt.compare(password, user.password);
                if (passwordsMatch) return user;
              }
              console.log('Invalid credentials');
              // return null; // return null to prevent the user from logging in.
              return null;

        },
      }),
  ],
  callbacks: {
    async session({token, session}): Promise<User | any> {
      console.log({
        sessionToken: token
      })
      if (token.role && session.user) {
        session.user.role = token.role
      }
    },
    async jwt({ token }) {
      if (!token.sub) return token;
      console.log('token', token)
      const getUserById = await prisma.user.findUnique({where: { id: token.sub }})
      if (!getUserById) return token;

      token.role = getUserById.role;
      return token
    }
  }
});