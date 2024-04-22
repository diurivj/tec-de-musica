import { Form } from '@remix-run/react';
import { Trash } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '~/components/ui/alert-dialog';
import { Button } from '~/components/ui/button';

type DeleteButtonProps = {
  title: string;
  description?: string | undefined;
  itemId: number;
  itemName: string;
  action?: string | undefined;
  fetcherKey?: string | undefined;
};

export function DeleteButton({
  action,
  itemId,
  itemName,
  title,
  description,
  fetcherKey
}: DeleteButtonProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size='icon' variant='default' className='bg-destructive'>
          <Trash className='h-5 w-5' />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel type='button'>Cancelar</AlertDialogCancel>
          <Form
            action={action}
            method='post'
            fetcherKey={fetcherKey}
            navigate={fetcherKey ? false : true}
            preventScrollReset
          >
            <AlertDialogAction
              type='submit'
              name={itemName}
              value={itemId}
              className='bg-destructive'
            >
              Borrar
            </AlertDialogAction>
          </Form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
