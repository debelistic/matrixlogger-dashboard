import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface BreadcrumbItem {
  name: string;
  href: string;
}

const pathMap: { [key: string]: string } = {
  organizations: 'Organizations',
  settings: 'Settings',
  members: 'Members',
  dashboard: 'Dashboard',
  apps: 'Apps',
  logs: 'Logs',
  apikeys: 'API Keys',
};

export default function Breadcrumb() {
  const pathname = usePathname();
  if (!pathname) return null;

  const paths = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = paths.map((path, index) => {
    const href = '/' + paths.slice(0, index + 1).join('/');
    return {
      name: pathMap[path] || path.charAt(0).toUpperCase() + path.slice(1),
      href,
    };
  });

  return (
    <nav className="flex mb-4" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <Link
            href="/dashboard"
            className="text-gray-400 hover:text-white text-sm flex items-center"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </Link>
        </li>
        {breadcrumbs.map((item, index) => (
          <li key={item.href} className="flex items-center">
            <svg
              className="h-4 w-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <Link
              href={item.href}
              className={`ml-2 text-sm ${
                index === breadcrumbs.length - 1
                  ? 'text-white font-medium'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
} 
