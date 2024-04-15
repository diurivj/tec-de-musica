import { cn } from '~/utils/styles';

type FormErrorProps = {
  id: string;
  className?: string | undefined;
  errors: Array<string> | undefined;
};

export function FormError({ id, className, errors }: FormErrorProps) {
  if (!errors?.length) return null;

  return (
    <div id={id} className={cn('text-xs text-destructive', className)}>
      {errors}
    </div>
  );
}
