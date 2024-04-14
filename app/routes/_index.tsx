import { z } from 'zod';
import type { ActionFunctionArgs, MetaFunction } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
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
import { authenticator, login } from '~/utils/auth.server';
import { FormError } from '~/components/FormError';
import { LoginSchema } from 'drizzle/schema';

export const meta: MetaFunction = () => {
  return [
    { title: 'Tecnólogico de música | Iniciar sesión' },
    { name: 'description', content: 'Tecnólogico de música portal web' }
  ];
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = await parseWithZod(formData, {
    schema: intent =>
      LoginSchema.transform(async (data, ctx) => {
        if (intent !== null) return { ...data, session: null };

        const session = await login(data);
        if (!session) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Correo electrónico o contraseña incorrectos'
          });
          return z.NEVER;
        }

        return { ...data, session };
      }),
    async: true
  });

  if (submission.status !== 'success' || !submission.value.session) {
    return submission.reply({ hideFields: ['password'] });
  }

  return await authenticator.authenticate('user-pass', request, {
    successRedirect: '/home',
    throwOnError: true,
    context: { formData }
  });
}

export default function Index() {
  const lastResult = useActionData<typeof action>();

  const [form, fields] = useForm({
    lastResult,
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onBlur',
    constraint: getZodConstraint(LoginSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: LoginSchema });
    }
  });

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
            <Button type='submit' className='w-full'>
              Iniciar sesión
            </Button>
            <FormError
              id={form.errorId}
              errors={form.errors}
              className='text-center'
            />
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
