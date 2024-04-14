import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from './db.server';
import { Authenticator } from 'remix-auth';
import { FormStrategy } from 'remix-auth-form';
import { sessionStorage } from './session.server';
import { UserSchema, type User, LoginSchema } from 'drizzle/schema';

const UserSessionSchema = UserSchema.omit({
  birthdate: true,
  phoneNumber: true,
  createdAt: true,
  updatedAt: true
});
type UserSession = z.infer<typeof UserSessionSchema>;

export const authenticator = new Authenticator<UserSession>(sessionStorage);

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const result = LoginSchema.safeParse({
      email: form.get('email'),
      password: form.get('password')
    });
    if (!result.success) throw new Error('Invalid form submission');

    const user = await login(result.data);
    if (!user) throw new Error('Correo electrónico o contraseña incorrectos');

    return user;
  }),
  'user-pass'
);

export async function login({
  email,
  password
}: {
  email: User['email'];
  password: string;
}) {
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email),
    columns: {
      id: true,
      email: true,
      name: true,
      lastname: true,
      role: true,
      profilePicture: true
    }
  });

  if (!user) return null;

  const userPassword = await db.query.passwords.findFirst({
    where: (passwords, { eq }) => eq(passwords.userId, user.id)
  });

  if (!userPassword) return null;

  const isPasswordCorrect = await bcrypt.compare(password, userPassword.hash);
  if (!isPasswordCorrect) return null;

  return user;
}
