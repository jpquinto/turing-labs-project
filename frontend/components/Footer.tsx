import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            © 2026 Turing Labs Inc. All rights reserved.
          </div>
          
          <div className="flex gap-6">
            <Link
              href="https://docs.turinglabs.jeremyquinto.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
            >
              Documentation
            </Link>
            <Link
              href="https://jeremyquinto.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
            >
              Portfolio
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

