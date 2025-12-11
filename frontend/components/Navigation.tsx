'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard' },
    { href: '/trials', label: 'Trials' },
    { href: '/recipes', label: 'Recipes' },
    { href: '/participants', label: 'Participants' },
    { href: '/submissions', label: 'Submissions' },
  ];

  return (
    <nav className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-zinc-900 dark:text-white">
                Turing Labs
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                      ? 'border-blue-500 text-zinc-900 dark:text-white'
                      : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-300'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
