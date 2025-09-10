'use client';

import { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';

interface BaseEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  height?: number;
  mode?: 'simple' | 'full';
  imageUpload?: boolean;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function BaseEditor({
  value,
  onChange,
  label,
  placeholder = 'متن خود را وارد کنید...',
  error,
  height = 200,
  mode = 'simple',
  imageUpload = false,
  disabled = false,
  required = false,
  className,
}: BaseEditorProps) {
  const [isFocused, setIsFocused] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      // Only update if the value is different to avoid cursor jumping
      if (document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = value;
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          document.execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          document.execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          document.execCommand('underline');
          break;
      }
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const insertImage = () => {
    const url = prompt('آدرس تصویر را وارد کنید:');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const insertLink = () => {
    const url = prompt('آدرس لینک را وارد کنید:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const insertList = (ordered: boolean = false) => {
    execCommand(ordered ? 'insertOrderedList' : 'insertUnorderedList');
  };

  const insertQuote = () => {
    execCommand('formatBlock', 'blockquote');
  };

  const insertCode = () => {
    execCommand('formatBlock', 'pre');
  };

  const clearFormatting = () => {
    execCommand('removeFormat');
  };

  const isCommandActive = (command: string) => {
    return document.queryCommandState(command);
  };

  const ToolbarButton = ({ 
    onClick, 
    children, 
    title, 
    active = false, 
    disabled: btnDisabled = false 
  }: {
    onClick: () => void;
    children: React.ReactNode;
    title: string;
    active?: boolean;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={btnDisabled || disabled}
      title={title}
      className={clsx(
        'p-2 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500',
        active && 'bg-blue-100 text-blue-600',
        (btnDisabled || disabled) && 'opacity-50 cursor-not-allowed'
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div
        className={clsx(
          'border rounded-md transition-colors duration-200',
          error
            ? 'border-red-500 focus-within:border-red-500'
            : isFocused
            ? 'border-blue-500'
            : 'border-gray-300',
          disabled && 'bg-gray-100'
        )}
      >
        {/* Toolbar */}
        {mode === 'full' && (
          <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-1">
              <ToolbarButton
                onClick={() => execCommand('bold')}
                title="پررنگ (Ctrl+B)"
                active={isCommandActive('bold')}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M12 6v8a4 4 0 01-4 4H6V2h2a4 4 0 014 4zM8 2v16h2a2 2 0 002-2V4a2 2 0 00-2-2H8z"/>
                </svg>
              </ToolbarButton>
              
              <ToolbarButton
                onClick={() => execCommand('italic')}
                title="مایل (Ctrl+I)"
                active={isCommandActive('italic')}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 2h8v2h-2l-4 12h2v2H4v-2h2l4-12H8V2z"/>
                </svg>
              </ToolbarButton>
              
              <ToolbarButton
                onClick={() => execCommand('underline')}
                title="زیرخط (Ctrl+U)"
                active={isCommandActive('underline')}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6 2v12a4 4 0 004 4h4a4 4 0 004-4V2h-2v12a2 2 0 01-2 2H8a2 2 0 01-2-2V2H6zM4 18h12v2H4v-2z"/>
                </svg>
              </ToolbarButton>
            </div>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            <div className="flex items-center gap-1">
              <ToolbarButton
                onClick={() => insertList(false)}
                title="لیست نقطه‌ای"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                </svg>
              </ToolbarButton>
              
              <ToolbarButton
                onClick={() => insertList(true)}
                title="لیست شماره‌دار"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 000 2h.01a1 1 0 100-2H3zm0 4a1 1 0 000 2h.01a1 1 0 100-2H3zm0 4a1 1 0 000 2h.01a1 1 0 100-2H3zm0 4a1 1 0 000 2h.01a1 1 0 100-2H3zM12 4a1 1 0 011-1h4a1 1 0 110 2h-4a1 1 0 01-1-1zm0 4a1 1 0 011-1h4a1 1 0 110 2h-4a1 1 0 01-1-1zm0 4a1 1 0 011-1h4a1 1 0 110 2h-4a1 1 0 01-1-1zm0 4a1 1 0 011-1h4a1 1 0 110 2h-4a1 1 0 01-1-1z" clipRule="evenodd"/>
                </svg>
              </ToolbarButton>
            </div>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            <div className="flex items-center gap-1">
              <ToolbarButton
                onClick={insertLink}
                title="درج لینک"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd"/>
                </svg>
              </ToolbarButton>
              
              {imageUpload && (
                <ToolbarButton
                  onClick={insertImage}
                  title="درج تصویر"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
                  </svg>
                </ToolbarButton>
              )}
            </div>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            <div className="flex items-center gap-1">
              <ToolbarButton
                onClick={insertQuote}
                title="نقل قول"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V8a1 1 0 112 0v2.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              </ToolbarButton>
              
              <ToolbarButton
                onClick={insertCode}
                title="کد"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              </ToolbarButton>
            </div>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            <ToolbarButton
              onClick={clearFormatting}
              title="پاک کردن فرمت"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
              </svg>
            </ToolbarButton>
          </div>
        )}

        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable={!disabled}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{ minHeight: height }}
          className={clsx(
            'p-3 focus:outline-none',
            !value && 'text-gray-500',
            disabled && 'cursor-not-allowed'
          )}
          data-placeholder={placeholder}
          suppressContentEditableWarning
        />

        {/* Placeholder */}
        {!value && (
          <div className="absolute inset-0 p-3 pointer-events-none text-gray-500">
            {placeholder}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
