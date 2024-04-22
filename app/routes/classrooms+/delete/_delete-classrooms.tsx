import { ActionFunctionArgs, redirect } from '@remix-run/node';
import { inArray } from 'drizzle-orm';
import { classrooms } from 'drizzle/schema';
import { z } from 'zod';
import { authenticator } from '~/utils/auth.server';
import { db } from '~/utils/db.server';

const schema = z.object({
  classroomIds: z.array(z.number())
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
  const classroomIds = formData.getAll('classroomId');

  const submission = schema.safeParse({
    classroomIds: classroomIds.map(Number)
  });

  if (!submission.success) {
    return {
      msg: 'Invalid form data',
      error: 'Invalid form data',
      result: null
    };
  }

  const result = await db
    .delete(classrooms)
    .where(inArray(classrooms.id, submission.data.classroomIds))
    .returning({ deletedIds: classrooms.id });

  const deletedItems = result.map(item => item.deletedIds);

  return {
    msg: `${deletedItems.length} classrooms deleted`,
    error: null,
    result: deletedItems
  };
}

export function loader() {
  return redirect('/classrooms');
}
