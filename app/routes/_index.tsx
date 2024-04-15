import type { ActionFunctionArgs, MetaFunction } from '@remix-run/node';
import { Form, redirect, useActionData } from '@remix-run/react';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { authenticator } from '~/utils/auth.server';
import { FormError } from '~/components/FormError';
import { LoginSchema } from 'drizzle/schema';
import { AuthorizationError } from 'remix-auth';
import { useIsPending } from '~/hooks/useIsPending';

export const meta: MetaFunction = () => {
  return [
    { title: 'Tecnólogico de música | Iniciar sesión' },
    { name: 'description', content: 'Tecnólogico de música portal web' }
  ];
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, {
    schema: LoginSchema
  });

  if (submission.status !== 'success') {
    return submission.reply({ hideFields: ['password'] });
  }

  try {
    const user = await authenticator.authenticate('user-pass', request, {
      throwOnError: true,
      context: { formData }
    });
    if (user) {
      return redirect('/home');
    }
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof AuthorizationError) {
      return submission.reply({
        hideFields: ['password'],
        fieldErrors: { password: [error.message] }
      });
    }
  }
}

export default function Index() {
  const lastResult = useActionData<typeof action>();

  const [form, fields] = useForm({
    id: 'login-form',
    lastResult,
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onBlur',
    constraint: getZodConstraint(LoginSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: LoginSchema });
    }
  });

  const isPending = useIsPending();

  return (
    <main className='flex h-dvh items-center justify-center'>
      <Card className='mx-auto max-w-sm'>
        <CardHeader>
          <CardTitle className='text-2xl'>Iniciar sesión</CardTitle>
          <CardDescription>
            Inicia sesión con tu cuenta de correo electrónico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form className='grid gap-4' method='post' {...getFormProps(form)}>
            <div className='grid gap-2'>
              <Label htmlFor={fields.email.id}>Correo electrónico</Label>
              <Input
                {...getInputProps(fields.email, { type: 'email' })}
                placeholder='Correo electrónico'
                autoComplete='off'
              />
              <FormError
                id={fields.email.errorId}
                errors={fields.email.errors}
              />
            </div>
            <div className='grid gap-2'>
              <div className='flex items-center'>
                <Label htmlFor={fields.password.id}>Contraseña</Label>
              </div>
              <Input
                {...getInputProps(fields.password, { type: 'password' })}
                placeholder='Contraseña'
                autoComplete='off'
              />
              <FormError
                id={fields.password.errorId}
                errors={fields.password.errors}
              />
            </div>
            <Button disabled={isPending} type='submit' className='w-full'>
              Iniciar sesión
            </Button>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
