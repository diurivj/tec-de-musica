import { Form, Link, NavLink } from '@remix-run/react';
import { CircleUser, Package2 } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './ui/dropdown-menu';
import { useUser } from '~/utils/user';
import { cn } from '~/utils/styles';

export function Navbar() {
  const user = useUser();

  function getLinks() {
    if (user.role === 'admin' || user.role === 'employee') {
      return [
        { name: 'Inicio', to: '/home' },
        { name: 'Alumnos', to: '/students' },
        { name: 'Profesores', to: '/teachers' },
        { name: 'Instrumentos', to: '/instruments' },
        { name: 'Salónes', to: '/classrooms' },
        { name: 'Admin', to: '/admin' }
      ];
    }

    return [];
  }

  const links = getLinks();

  return (
    <header className='sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6'>
      <nav className='hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6'>
        <Link
          to='/home'
          className='flex items-center gap-2 text-lg font-semibold md:text-base'
        >
          <Package2 className='h-6 w-6' />
          <span className='sr-only'>Tecnólogico de música</span>
        </Link>
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn(
                'text-muted-foreground transition-colors hover:text-foreground',
                isActive && 'text-foreground'
              )
            }
          >
            {link.name}
          </NavLink>
        ))}
      </nav>
      <div className='flex w-full items-center justify-end gap-4 md:ml-auto md:gap-2 lg:gap-4'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='secondary' size='icon' className='rounded-full'>
              <CircleUser className='h-5 w-5' />
              <span className='sr-only'>Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>
              <p>
                {user.name} {user.lastname}
              </p>
              <p className='font-normal text-muted-foreground'>{user.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Form method='post' action='/logout'>
                <button className='w-full text-left'>Cerrar sesión</button>
              </Form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
