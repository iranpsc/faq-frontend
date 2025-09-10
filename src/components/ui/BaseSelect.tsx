'use client';

import { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';

interface SelectOption {
  id: string;
  name: string;
  [key: string]: any;
}

interface BaseSelectProps<T extends SelectOption = SelectOption> {
  value: T | T[] | null;
  options: T[];
  onChange: (value: T | T[] | null) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  multiple?: boolean;
  searchable?: boolean;
  taggable?: boolean;
  onTagAdd?: (tag: string) => void;
  onFetchMore?: (page: number, search?: string) => Promise<void>;
  paginated?: boolean;
  pageSize?: number;
  loading?: boolean;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function BaseSelect<T = SelectOption>({
  value,
  options,
  onChange,
  label,
  placeholder = 'انتخاب کنید...',
  error,
  multiple = false,
  searchable = false,
  taggable = false,
  onTagAdd,
  onFetchMore,
  paginated = false,
  pageSize = 10,
  loading = false,
  disabled = false,
  required = false,
  className,
}: BaseSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [newTag, setNewTag] = useState('');
  
  const selectRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setNewTag('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleSelect = (option: T) => {
    if (multiple) {
      const currentValue = Array.isArray(value) ? value : [];
      const isSelected = currentValue.some(item => item.id === option.id);
      
      if (isSelected) {
        onChange(currentValue.filter(item => item.id !== option.id));
      } else {
        onChange([...currentValue, option]);
      }
    } else {
      onChange(option);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const handleRemoveTag = (optionToRemove: T) => {
    if (multiple && Array.isArray(value)) {
      onChange(value.filter(item => item.id !== optionToRemove.id));
    }
  };

  const handleAddNewTag = () => {
    if (newTag.trim() && onTagAdd) {
      onTagAdd(newTag.trim());
      setNewTag('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && taggable && newTag.trim()) {
      e.preventDefault();
      handleAddNewTag();
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!paginated || !onFetchMore || isLoadingMore) return;

    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 5) {
      setIsLoadingMore(true);
      onFetchMore(currentPage + 1, searchTerm).finally(() => {
        setIsLoadingMore(false);
        setCurrentPage(prev => prev + 1);
      });
    }
  };

  const getDisplayValue = () => {
    if (multiple && Array.isArray(value)) {
      if (value.length === 0) return placeholder;
      if (value.length === 1) return value[0].name;
      return `${value.length} مورد انتخاب شده`;
    }
    
    if (value && !Array.isArray(value)) {
      return value.name;
    }
    
    return placeholder;
  };

  const isSelected = (option: T) => {
    if (multiple && Array.isArray(value)) {
      return value.some(item => item.id === option.id);
    }
    return value && !Array.isArray(value) && value.id === option.id;
  };

  return (
    <div className="w-full" ref={selectRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={clsx(
            'relative w-full cursor-default rounded-md border py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 sm:text-sm',
            error
              ? 'border-red-500 focus:border-red-500'
              : 'border-gray-300 focus:border-blue-500',
            disabled
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
              : 'bg-white text-gray-900'
          )}
        >
          <span className={clsx(
            'block truncate',
            (!value || (Array.isArray(value) && value.length === 0)) && 'text-gray-500'
          )}>
            {getDisplayValue()}
          </span>
          
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <svg
              className={clsx(
                'h-5 w-5 text-gray-400 transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
            {searchable && (
              <div className="p-2 border-b">
                <input
                  ref={searchRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="جستجو..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            {taggable && (
              <div className="p-2 border-b">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="برچسب جدید..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewTag}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    اضافه
                  </button>
                </div>
              </div>
            )}

            <div
              className="max-h-60 overflow-auto"
              onScroll={handleScroll}
            >
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  در حال بارگذاری...
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm ? 'نتیجه‌ای یافت نشد' : 'گزینه‌ای موجود نیست'}
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => handleSelect(option)}
                    className={clsx(
                      'relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-blue-50',
                      isSelected(option) && 'bg-blue-100 text-blue-900'
                    )}
                  >
                    <span className="block truncate font-normal">
                      {option.name}
                    </span>
                    {isSelected(option) && (
                      <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </div>
                ))
              )}
              
              {isLoadingMore && (
                <div className="p-2 text-center text-gray-500 text-sm">
                  در حال بارگذاری بیشتر...
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected tags for multiple selection */}
      {multiple && Array.isArray(value) && value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {value.map((item) => (
            <span
              key={item.id}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
            >
              {item.name}
              <button
                type="button"
                onClick={() => handleRemoveTag(item)}
                className="text-blue-600 hover:text-blue-800"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
