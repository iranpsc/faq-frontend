'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, X, Search } from 'lucide-react';
import { apiService } from '@/services/api';
import { Tag } from '@/services/types';

interface SortOption {
  value: string;
  label: string;
}

interface FilterQuestionProps {
  onFiltersChanged?: (filters: Record<string, unknown>) => void;
}

export function FilterQuestion({ onFiltersChanged }: FilterQuestionProps) {
  // Filter states
  const [showTagsFilter, setShowTagsFilter] = useState(false);
  const [showSortFilter, setShowSortFilter] = useState(false);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedSortOptions, setSelectedSortOptions] = useState('');
  const [appliedTags, setAppliedTags] = useState<Tag[]>([]);
  const [appliedSortOptions, setAppliedSortOptions] = useState<SortOption[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);

  const tagsDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Sort options
  const sortOptions: SortOption[] = [
    { value: 'newest', label: 'جدید' },
    { value: 'oldest', label: 'قدیمی' },
    { value: 'most_votes', label: 'رای' },
    { value: 'most_answers', label: 'پاسخ ها' },
    { value: 'most_views', label: 'بازدید ها' },
    { value: 'unanswered', label: 'بی پاسخ' },
    { value: 'solved', label: 'حل شده' },
    { value: 'unsolved', label: 'حل نشده' }
  ];

  // Computed properties
  const filteredTags = availableTags;

  const hasActiveFilters = appliedTags.length > 0 || appliedSortOptions.length > 0;

  // Fetch tags only when dropdown is opened or search query changes
  useEffect(() => {
    if (!showTagsFilter) return;
    
    let isCancelled = false;

    const fetchTags = async (q: string) => {
      try {
        // Prefer backend 'query' param to match Vue implementation
        const data = await apiService.getTags(q ? { query: q } : {});
        if (!isCancelled) {
          setAvailableTags(data);
        }
      } catch {
        if (!isCancelled) {
          setAvailableTags([]);
        }
      }
    };

    // Fetch tags when dropdown opens
    if (availableTags.length === 0 && tagSearchQuery === '') {
      fetchTags('');
    }

    // Debounced fetch on search input
    const debounceTimer = window.setTimeout(() => {
      fetchTags(tagSearchQuery.trim());
    }, 300);

    return () => {
      isCancelled = true;
      if (debounceTimer) window.clearTimeout(debounceTimer);
    };
  }, [showTagsFilter, tagSearchQuery, availableTags.length]);

  // Filter methods
  const toggleTagsFilter = () => {
    setShowTagsFilter(!showTagsFilter);
    if (showSortFilter) setShowSortFilter(false);
  };

  const toggleSortFilter = () => {
    setShowSortFilter(!showSortFilter);
    if (showTagsFilter) setShowTagsFilter(false);
  };

  const applyFilters = (nextAppliedTags?: Tag[], nextAppliedSortOptions?: SortOption[]) => {
    const params: Record<string, string | number> = { page: 1 };

    const tagsToUse = nextAppliedTags ?? appliedTags;
    const sortToUse = nextAppliedSortOptions ?? appliedSortOptions;

    // Apply tag filters
    if (tagsToUse.length > 0) {
      params.tags = tagsToUse.map(tag => tag.id).join(',');
    }

    // Apply sort filters (use the first selected sort option)
    if (sortToUse.length > 0) {
      const primarySort = sortToUse[0].value;
      switch (primarySort) {
        case 'newest':
          params.sort = 'created_at';
          params.order = 'desc';
          break;
        case 'oldest':
          params.sort = 'created_at';
          params.order = 'asc';
          break;
        case 'most_votes':
          params.sort = 'votes';
          params.order = 'desc';
          break;
        case 'most_answers':
          params.sort = 'answers_count';
          params.order = 'desc';
          break;
        case 'most_views':
          params.sort = 'views_count';
          params.order = 'desc';
          break;
        case 'unanswered':
          params.filter = 'unanswered';
          break;
        case 'solved':
          params.filter = 'solved';
          break;
        case 'unsolved':
          params.filter = 'unsolved';
          break;
      }
    }
    onFiltersChanged?.(params);
  };

  const applyTagFilters = () => {
    const newAppliedTags = availableTags.filter(tag =>
      selectedTags.includes(tag.id)
    );
    setAppliedTags(newAppliedTags);
    setShowTagsFilter(false);
    applyFilters(newAppliedTags, undefined);
  };

  const clearTagFilters = () => {
    setSelectedTags([]);
    setAppliedTags([]);
    setShowTagsFilter(false);
    applyFilters([], undefined);
  };

  const applySortFilters = () => {
    const newAppliedSortOptions = sortOptions.filter(option =>
      option.value === selectedSortOptions
    );
    setAppliedSortOptions(newAppliedSortOptions);
    setShowSortFilter(false);
    applyFilters(undefined, newAppliedSortOptions);
  };

  const removeTagFilter = (tagId: string) => {
    const nextSelected = selectedTags.filter(id => id !== tagId);
    const nextApplied = appliedTags.filter(tag => tag.id !== tagId);
    setSelectedTags(nextSelected);
    setAppliedTags(nextApplied);
    applyFilters(nextApplied, undefined);
  };

  const removeSortFilter = (sortValue: string) => {
    if (selectedSortOptions === sortValue) {
      setSelectedSortOptions('');
    }
    const nextAppliedSort = appliedSortOptions.filter(option => option.value !== sortValue);
    setAppliedSortOptions(nextAppliedSort);
    applyFilters(undefined, nextAppliedSort);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagsDropdownRef.current && !tagsDropdownRef.current.contains(event.target as Node)) {
        setShowTagsFilter(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setShowSortFilter(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col items-start justify-between mb-6">
      <h5 className="font-bold text-gray-900 dark:text-gray-100 mb-4">
        فیلترها
      </h5>

      {/* Filter Section */}
      <div className="w-full space-y-4">
        {/* Filter Categories */}
        <div className="flex gap-4">
          {/* Sort Filter */}
          <div className="relative" ref={sortDropdownRef}>
            <button
              onClick={toggleSortFilter}
              className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronDown className={`w-4 h-4 transform transition-transform ${showSortFilter ? 'rotate-180' : ''}`} />
              مرتب سازی بر اساس
            </button>

            {/* Sort Dropdown */}
            {showSortFilter && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                <div className="p-4">
                  <div className="space-y-2">
                    {sortOptions.map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded"
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={selectedSortOptions === option.value}
                          onChange={(e) => setSelectedSortOptions(e.target.value)}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                          name="sortOptionRadio"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
                      </label>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={applySortFilters}
                      className="w-full px-2 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      اعمال
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tags Filter */}
          <div className="relative" ref={tagsDropdownRef}>
            <button
              onClick={toggleTagsFilter}
              className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronDown className={`w-4 h-4 transform transition-transform ${showTagsFilter ? 'rotate-180' : ''}`} />
              برچسب ها
            </button>

            {/* Tags Dropdown */}
            {showTagsFilter && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                <div className="p-4">
                  <div className="relative mb-3">
                    <input
                      type="text"
                      value={tagSearchQuery}
                      onChange={(e) => setTagSearchQuery(e.target.value)}
                      placeholder="جستجو..."
                      className="w-full px-3 py-1.5 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {filteredTags.map((tag) => (
                      <label
                        key={tag.id}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          value={tag.id}
                          checked={selectedTags.includes(tag.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTags([...selectedTags, tag.id]);
                            } else {
                              setSelectedTags(selectedTags.filter(id => id !== tag.id));
                            }
                          }}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{tag.name}</span>
                      </label>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={applyTagFilters}
                      className="flex-1 px-2 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      انتخاب
                    </button>
                    <button
                      onClick={clearTagFilters}
                      className="flex-1 px-2 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="space-y-3">
            {/* Selected Tags */}
            {appliedTags.length > 0 && (
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">برچسب ها:</div>
                <div className="flex flex-wrap gap-2">
                  {appliedTags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                    >
                      {tag.name}
                      <button
                        onClick={() => removeTagFilter(tag.id)}
                        className="text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Sort Options */}
            {appliedSortOptions.length > 0 && (
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">مرتب سازی بر اساس:</div>
                <div className="flex flex-wrap gap-2">
                  {appliedSortOptions.map((option) => (
                    <span
                      key={option.value}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm"
                    >
                      {option.label}
                      <button
                        onClick={() => removeSortFilter(option.value)}
                        className="text-green-600 dark:text-green-300 hover:text-green-800 dark:hover:text-green-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}