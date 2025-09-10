'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { clsx } from 'clsx';

export function SearchComponent() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="جستجو در سوالات..."
          className={clsx(
            'block w-full pr-10 pl-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg',
            'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100',
            'placeholder-gray-500 dark:placeholder-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'transition-colors duration-200'
          )}
        />
      </div>
    </form>
  );
}
