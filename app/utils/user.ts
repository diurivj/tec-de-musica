import type { SerializeFrom } from '@remix-run/node';
import type { loader as rootLoader } from '~/root';
import { useRouteLoaderData } from '@remix-run/react';
import { UserSessionSchema } from 'drizzle/schema';

function isUser(
  user: unknown
): user is SerializeFrom<typeof rootLoader>['user'] {
  const userParsed = UserSessionSchema.safeParse(user);
  return userParsed.success;
}

export function useOptionalUser() {
  const data = useRouteLoaderData<typeof rootLoader>('root');
  if (!data || !isUser(data.user)) {
    return undefined;
  }
  return data.user;
}

export function useUser() {
  const maybeUser = useOptionalUser();
  if (!maybeUser) {
    throw new Error(
      'No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead.'
    );
  }
  return maybeUser;
}
