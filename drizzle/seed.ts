import bcrypt from 'bcryptjs';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import {
  InsertUser,
  classrooms,
  instruments,
  passwords,
  users
} from './schema';

const client = createClient({
  url: String(process.env.TURSO_DB_URL),
  authToken: process.env.TURSO_DB_AUTH_TOKEN as string
});

const db = drizzle(client);

const mockClassrooms = [
  'A Domicilio',
  'Chopin',
  'DJ',
  'En Línea',
  'Jaco Pastorius',
  'Joe Pass',
  'John Coltrane',
  'Louis Armstrong',
  'Mozart',
  'Pat Matheny',
  'Petruccini',
  'Quincy Jones',
  'Ray Charles',
  'Steve Gadd'
];

const mockInstruments = [
  'Armónica',
  'Bajo',
  'Batería',
  'Batería Kids',
  'Canto',
  'DJ',
  'Estimulación Temprana',
  'Grabación',
  'Guitarra Acústica',
  'Guitarra Acústica Kids',
  'Guitarra Eléctrica',
  'Guitarra Eléctrica Kids',
  'Iniciación Musical',
  'Iniciación Musical Piano',
  'Piano',
  'Piano Kids',
  'Producción Musical',
  'Saxofón',
  'Teoría Musical',
  'Trompeta',
  'Violín'
];

const mockUsers: Array<InsertUser> = [
  {
    id: 1,
    email: 'admin@admin.com',
    name: 'Admin',
    lastname: 'Admin',
    role: 'admin'
  },
  {
    id: 2,
    email: 'employee@employee.com',
    name: 'Employee',
    lastname: 'Employee',
    role: 'employee'
  },
  {
    id: 3,
    email: 'student@student.com',
    name: 'Student',
    lastname: 'Student',
    role: 'student'
  },
  {
    id: 4,
    email: 'teacher@teacher.com',
    name: 'Teacher',
    lastname: 'Teacher',
    role: 'teacher'
  }
];

async function seed() {
  await db.delete(classrooms).execute();
  console.log('Deleted all classrooms');

  const classroomsResult = await db
    .insert(classrooms)
    .values(mockClassrooms.map(c => ({ name: c })))
    .returning();
  console.log(`Inserted: ${classroomsResult.length} classrooms`);

  await db.delete(instruments).execute();
  console.log('Deleted all instruments');

  const instrumentsResult = await db
    .insert(instruments)
    .values(mockInstruments.map(i => ({ name: i })))
    .returning();
  console.log(`Inserted: ${instrumentsResult.length} instruments`);

  await db.delete(users).execute();
  console.log('Deleted all users');

  const usersResult = await db.insert(users).values(mockUsers).returning();
  console.log(`Inserted: ${usersResult.length} users`);

  await db.delete(passwords).execute();
  console.log('Deleted all passwords');

  for (let index = 1; index <= mockUsers.length; index++) {
    await db.insert(passwords).values({
      hash: bcrypt.hashSync('password', 10),
      userId: index
    });
    console.log(`Inserted password for user ${index}`);
  }

  process.exit(0);
}

seed();
