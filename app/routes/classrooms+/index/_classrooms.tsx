import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect
} from '@remix-run/node';
import {
  Form,
  useActionData,
  useFetcher,
  useLoaderData
} from '@remix-run/react';
import { InsertClassroomSchema, classrooms } from 'drizzle/schema';
import { Pencil } from 'lucide-react';
import { FormError } from '~/components/FormError';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { authenticator } from '~/utils/auth.server';
import { db } from '~/utils/db.server';
import { z } from 'zod';
import { DeleteButton } from '~/components/delete-button';
import { useState } from 'react';

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
  const [editableMode, setEditableMode] = useState<{
    id: null | number;
    enabled: boolean;
  }>({
    id: null,
    enabled: false
  });

  const editFetcher = useFetcher({ key: 'edit-classroom' });

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

  function handleEdit(id: number) {
    setEditableMode({ id, enabled: true });
    setTimeout(() => document.getElementById(`classroom-${id}`)?.focus(), 10);
  }

  function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    editFetcher.submit(formData, {
      action: '/classrooms/edit',
      method: 'post',
      preventScrollReset: true,
      navigate: false,
      unstable_flushSync: true
    });

    setEditableMode({ id: null, enabled: false });
  }

  function handleOptimisticName(id: number) {
    if (id === Number(editFetcher.formData?.get('classroom-id') as string)) {
      return editFetcher.formData?.get('classroom-name') as string;
    }
  }

  const deleteButtonProps = {
    action: '/classrooms/delete',
    title: '¿Estás seguro de que deseas eliminar este salón?',
    description: 'Esta acción no se puede deshacer.',
    itemName: 'classroomId'
  };

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
          <Button type='submit'>Agregar</Button>
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
                  {editableMode.enabled && classroom.id === editableMode.id ? (
                    <Form
                      action='/classrooms/edit'
                      method='post'
                      fetcherKey='edit-classroom'
                      navigate={false}
                      preventScrollReset
                      onSubmit={handleEditSubmit}
                    >
                      <Input
                        id={`classroom-${classroom.id}`}
                        name='classroom-name'
                        className='border-none text-base shadow-none'
                        defaultValue={
                          handleOptimisticName(classroom.id) || classroom.name
                        }
                        onBlur={() =>
                          setEditableMode({ id: null, enabled: false })
                        }
                      />
                      <input
                        type='hidden'
                        name='classroom-id'
                        value={classroom.id}
                        readOnly
                        hidden
                      />
                    </Form>
                  ) : (
                    handleOptimisticName(classroom.id) || classroom.name
                  )}
                </td>
                <td className='border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right'>
                  <div className='flex gap-x-2'>
                    <Button
                      size='icon'
                      variant='outline'
                      type='button'
                      onClick={() => handleEdit(classroom.id)}
                    >
                      <Pencil className='h-5 w-5' />
                    </Button>
                    <DeleteButton
                      {...deleteButtonProps}
                      itemId={classroom.id}
                    />
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
