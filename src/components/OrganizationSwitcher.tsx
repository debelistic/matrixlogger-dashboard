import { useState, useRef, useEffect } from 'react';
import { useOrganization } from '../context/OrganizationContext';
import { useRouter } from 'next/navigation';

export default function OrganizationSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const { organizations, currentOrganization, setCurrentOrganization } = useOrganization();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOrganizationSelect = (orgId: string) => {
    const org = organizations.find(o => o._id === orgId);
    if (org) {
      setCurrentOrganization(org);
      setIsOpen(false);
      router.push('/dashboard');
    }
  };

  if (!currentOrganization) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
      >
        <div className="flex-shrink-0 h-6 w-6 rounded bg-accent flex items-center justify-center">
          <span className="text-white text-sm font-medium">
            {currentOrganization.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex items-center">
          <span className="text-sm font-medium text-white">
            {currentOrganization.name}
          </span>
          <svg
            className={`ml-2 h-5 w-5 text-gray-400 transition-transform ${
              isOpen ? 'transform rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 shadow-lg z-50">
          <div className="py-2">
            {organizations.map((org) => (
              <button
                key={org._id}
                onClick={() => handleOrganizationSelect(org._id)}
                className={`w-full text-left px-4 py-2 text-sm ${
                  org._id === currentOrganization._id
                    ? 'bg-accent text-white'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 h-6 w-6 rounded bg-accent/20 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {org.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{org.name}</p>
                    {org.description && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {org.description}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
            <div className="border-t border-white/10 mt-2 pt-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push('/organizations/new');
                }}
                className="w-full text-left px-4 py-2 text-sm text-accent hover:bg-white/5"
              >
                Create New Organization
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
