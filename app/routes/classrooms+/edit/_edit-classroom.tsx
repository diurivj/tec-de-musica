import { ActionFunctionArgs, redirect } from '@remix-run/node';
import { eq } from 'drizzle-orm';
import { classrooms } from 'drizzle/schema';
import { z } from 'zod';
import { authenticator } from '~/utils/auth.server';
import { db } from '~/utils/db.server';

const schema = z.object({
  id: z.number(),
  name: z.string()
});

export async function action({ request }: ActionFunctionArgs) {
  const user = await authenticator.isAuthenticated(request);
  const allowedRoles = ['admin', 'employee'];

  if (!user) {
    throw new Error('Unauthorized');
  }

  if (!allowedRoles.includes(user.role)) {
    throw new Error('Unauthorized');
  }

  const formData = await request.formData();
  const id = formData.get('classroom-id');
  const name = formData.get('classroom-name');

  const submission = schema.safeParse({
    id: Number(id),
    name
  });

  if (!submission.success) {
    return {
      msg: 'Invalid form data',
      error: 'Invalid form data',
      result: null
    };
  }

  const [result] = await db
    .update(classrooms)
    .set({ name: submission.data.name })
    .where(eq(classrooms.id, submission.data.id))
    .returning({ updatedId: classrooms.id });

  return {
    msg: `Classroom ${result.updatedId} updated`,
    error: null,
    result: `Classrom name has been updated to ${submission.data.name}`
  };
}

export function loader() {
  return redirect('/classrooms');
}
