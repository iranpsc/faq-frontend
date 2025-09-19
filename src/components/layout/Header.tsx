'use client';

import { useState } from 'react';
import { Menu, X, Plus, Search } from 'lucide-react';
import { BaseButton } from '../ui/BaseButton';
import { SearchComponent } from './index';

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onMainAction: () => void;
  mobileSearchOpen?: boolean;
  onToggleMobileSearch?: () => void;
}

export function Header({ sidebarOpen, onToggleSidebar, onMainAction, mobileSearchOpen: externalMobileSearchOpen, onToggleMobileSearch }: HeaderProps) {
  const [internalMobileSearchOpen, setInternalMobileSearchOpen] = useState(false);
  const mobileSearchOpen = externalMobileSearchOpen !== undefined ? externalMobileSearchOpen : internalMobileSearchOpen;

  const toggleMobileSearch = () => {
    if (onToggleMobileSearch) {
      onToggleMobileSearch();
    } else {
      setInternalMobileSearchOpen(!internalMobileSearchOpen);
    }
  };

  return (
    <header 
      className="header-container bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-4 py-3 transition-colors duration-300"
      style={{ minHeight: '56px' }}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left side - Menu button (hidden on large screens) */}
        <div className="flex items-center gap-4 lg:hidden">
          <BaseButton
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            aria-label={sidebarOpen ? 'بستن منو' : 'باز کردن منو'}
          >
            {sidebarOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </BaseButton>
        </div>

        {/* Center - Search bar (desktop) */}
        <div className="flex-1 max-w-2xl mx-4 hidden md:block">
          <SearchComponent 
            position="desktop" 
            mobileSearchOpen={mobileSearchOpen}
            onMobileSearchToggle={toggleMobileSearch}
          />
        </div>

        {/* Right side - Action buttons */}
        <div className="flex items-center gap-3">
          {/* Mobile search button (hidden on large screens) */}
          <BaseButton
            variant="ghost"
            size="sm"
            onClick={toggleMobileSearch}
            className="md:hidden"
            aria-label="جستجو"
            data-mobile-search-trigger
          >
            <Search className="w-5 h-5" />
          </BaseButton>
          
          {/* Main action button */}
          <BaseButton
            variant="primary"
            size="lg"
            rounded="xl"
            onClick={onMainAction}
          >
            <Plus className="w-5 h-5" />
            بپرس
          </BaseButton>
        </div>
      </div>
      
      {/* Mobile Search Bar - appears in new row below header */}
      {mobileSearchOpen && (
        <div className="max-w-7xl mx-auto mt-3 md:hidden">
          <SearchComponent 
            position="mobile" 
            mobileSearchOpen={mobileSearchOpen}
            onMobileSearchToggle={toggleMobileSearch}
          />
        </div>
      )}
    </header>
  );
}
