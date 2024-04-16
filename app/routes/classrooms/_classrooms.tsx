import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect
} from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { InsertClassroomSchema, classrooms } from 'drizzle/schema';
import { Pencil, Trash } from 'lucide-react';
import { z } from 'zod';
import { FormError } from '~/components/FormError';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { authenticator } from '~/utils/auth.server';
import { db } from '~/utils/db.server';

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = await parseWithZod(formData, {
    schema: InsertClassroomSchema.superRefine(async (data, ctx) => {
      const result = await db.query.classrooms.findFirst({
        where: (classrooms, { eq }) => eq(classrooms.name, data.name)
      });
      if (result) {
        ctx.addIssue({
          path: ['name'],
          code: z.ZodIssueCode.custom,
          message: 'El salón ya existe'
        });
        return;
      }
    }),
    async: true
  });

  if (submission.status !== 'success') {
    return submission.reply();
  }

  await db
    .insert(classrooms)
    .values(submission.value)
    .returning({ insertedId: classrooms.id });

  return submission.reply();
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/'
  });

  const allowedRoles = ['admin', 'employee'];
  if (!allowedRoles.includes(user.role)) {
    throw redirect('/');
  }

  const classrooms = await db.query.classrooms.findMany({
    orderBy: (classrooms, { asc }) => [asc(classrooms.name)]
  });

  return { classrooms };
}

export default function Classrooms() {
  const { classrooms } = useLoaderData<typeof loader>();

  const lastResult = useActionData<typeof action>();
  const [form, fields] = useForm({
    id: `create-classroom-${classrooms.length}`,
    lastResult,
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onBlur',
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: InsertClassroomSchema });
    }
  });

  return (
    <div className='px-4 py-10 md:px-6'>
      <h1 className='scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl'>
        Salónes
      </h1>

      <main className='mt-10 grid grid-cols-2 gap-x-8'>
        <Form method='post' {...getFormProps(form)} className='space-y-4'>
          <h3 className='scroll-m-20 text-2xl font-semibold tracking-tight'>
            Agregar salón
          </h3>
          <div className='space-y-1'>
            <Label htmlFor={fields.name.id}>Nombre del salón</Label>
            <Input
              {...getInputProps(fields.name, { type: 'text' })}
              placeholder='Nombre del salón'
              autoComplete='off'
            />
            <FormError id={fields.name.errorId} errors={fields.name.errors} />
          </div>
          <Button>Agregar</Button>
        </Form>
        <table className='w-full'>
          <thead>
            <tr className='m-0 border-t p-0 even:bg-muted'>
              <th className='border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right'>
                Nombre del salón
              </th>
              <th className='w-[100px] border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right'>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {classrooms.map(classroom => (
              <tr key={classroom.id} className='m-0 border-t p-0 even:bg-muted'>
                <td className='border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right'>
                  {classroom.name}
                </td>
                <td className='border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right'>
                  <div className='flex gap-x-2'>
                    <Button size='icon' variant='outline'>
                      <Pencil className='h-5 w-5' />
                    </Button>
                    <Button
                      size='icon'
                      variant='default'
                      className='bg-destructive'
                    >
                      <Trash className='h-5 w-5' />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}
