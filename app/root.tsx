import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData
} from '@remix-run/react';
import type { LinksFunction, LoaderFunctionArgs } from '@remix-run/node';
import { authenticator } from './utils/auth.server';
import { Navbar } from './components/Navbar';
import stylesheet from '~/tailwind.css?url';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesheet }
];

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request);
  return { user };
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <>
      {user ? <Navbar /> : null}
      <Outlet />
    </>
  );
}
