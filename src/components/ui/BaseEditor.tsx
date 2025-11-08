'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { Editor } from '@ckeditor/ckeditor5-core';

interface CKEditorFileLoader {
  file: Promise<File>;
}

type CKEditorConstructor = {
  create: (...args: unknown[]) => Promise<Editor>;
  EditorWatchdog: unknown;
  ContextWatchdog: unknown;
};

const ensureFileLoader = (loader: unknown): CKEditorFileLoader => {
  if (!loader || typeof (loader as CKEditorFileLoader).file === 'undefined') {
    throw new Error('Invalid CKEditor file loader');
  }
  return loader as CKEditorFileLoader;
};

type EditorWithExtras = Editor & {
  getData: () => string;
  ui: {
    view: {
      editable: { element: HTMLElement | null };
      toolbar: { element: HTMLElement | null };
    };
  };
};

const CKEditor = dynamic(
  () =>
    import('@ckeditor/ckeditor5-react').then((mod) => ({
      default: mod.CKEditor,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-48 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600">
        <div className="text-gray-500 dark:text-gray-400">
          در حال بارگذاری ویرایشگر...
        </div>
      </div>
    ),
  }
);

let ClassicEditor: CKEditorConstructor | null = null;

interface BaseEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  imageUpload?: boolean;
  className?: string;
  rtl?: boolean;
}

export function BaseEditor({
  value,
  onChange,
  placeholder = 'متن خود را بنویسید...',
  imageUpload = false,
  className = '',
  rtl = true,
}: BaseEditorProps) {
  const [isClient, setIsClient] = useState(false);
  const [editorLoaded, setEditorLoaded] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const getResponsiveHeight = () => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 ? 200 : 400; // Mobile: 200px, Desktop: 500px
    }
    return 400;
  };

  // Base64 Upload Adapter (برای آپلود تصویر)
  class Base64UploadAdapter {
    loader: CKEditorFileLoader;
    constructor(loader: CKEditorFileLoader) {
      this.loader = loader;
    }
    upload() {
      return this.loader.file.then(
        (file: File) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.addEventListener('load', () => {
              resolve({ default: reader.result });
            });
            reader.addEventListener('error', () => {
              reject(reader.error);
            });
            reader.readAsDataURL(file);
          })
      );
    }
    abort() {}
  }

  function uploadPlugin(editor: Editor) {
    const fileRepository = editor.plugins.get('FileRepository') as unknown as {
      createUploadAdapter: (loader: unknown) => unknown;
    };
    fileRepository.createUploadAdapter = (loader: unknown) => new Base64UploadAdapter(ensureFileLoader(loader));
  }

  const editorConfiguration: Record<string, unknown> = {
    placeholder,
    extraPlugins: imageUpload ? [uploadPlugin] : [],
    language: rtl ? 'fa' : 'en',
    direction: rtl ? 'rtl' : 'ltr',
    toolbar: [
      'heading',
      '|',
      'bold',
      'italic',
      'underline',
      'strikethrough',
      '|',
      'fontSize',
      'fontFamily',
      '|',
      'fontColor',
      'fontBackgroundColor',
      '|',
      'bulletedList',
      'numberedList',
      '|',
      'outdent',
      'indent',
      '|',
      'alignment',
      '|',
      'link',
      'blockQuote',
      'insertTable',
      '|',
      ...(imageUpload ? ['imageUpload'] : []),
      '|',
      'undo',
      'redo',
    ],
    // Dark theme configuration
    ui: {
      viewportOffset: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    },
    // Enhanced styling for dark theme
    styles: `
      .ck-editor__editable {
        background-color: var(--ck-color-base-background, #ffffff) !important;
        color: var(--ck-color-base-foreground, #000000) !important;
        border: 1px solid var(--ck-color-base-border, #c4c4c4) !important;
      }
      
      .dark .ck-editor__editable {
        background-color: var(--ck-color-base-background, #1f2937) !important;
        color: var(--ck-color-base-foreground, #f9fafb) !important;
        border: 1px solid var(--ck-color-base-border, #374151) !important;
      }
      
      .ck-editor__main {
        background-color: var(--ck-color-base-background, #ffffff) !important;
      }
      
      .dark .ck-editor__main {
        background-color: var(--ck-color-base-background, #1f2937) !important;
      }
      
      .ck-toolbar {
        background-color: var(--ck-color-toolbar-background, #f8f9fa) !important;
        border: 1px solid var(--ck-color-toolbar-border, #c4c4c4) !important;
      }
      
      .dark .ck-toolbar {
        background-color: var(--ck-color-toolbar-background, #374151) !important;
        border: 1px solid var(--ck-color-toolbar-border, #4b5563) !important;
      }
      
      .ck-button {
        color: var(--ck-color-button-text, #000000) !important;
      }
      
      .dark .ck-button {
        color: var(--ck-color-button-text, #f9fafb) !important;
      }
      
      .ck-button:hover {
        background-color: var(--ck-color-button-hover-background, #e5e7eb) !important;
      }
      
      .dark .ck-button:hover {
        background-color: var(--ck-color-button-hover-background, #4b5563) !important;
      }
      
      .ck-button.ck-on {
        background-color: var(--ck-color-button-on-background, #d1d5db) !important;
        color: var(--ck-color-button-on-text, #000000) !important;
      }
      
      .dark .ck-button.ck-on {
        background-color: var(--ck-color-button-on-background, #6b7280) !important;
        color: var(--ck-color-button-on-text, #f9fafb) !important;
      }
    `,
  };

  useEffect(() => {
    setIsClient(true);
    const loadEditor = async () => {
      try {
        const editorModule = await import('@ckeditor/ckeditor5-build-classic');
        ClassicEditor = editorModule.default as unknown as CKEditorConstructor;
        setEditorLoaded(true);
      } catch (error) {
        console.error('Failed to load CKEditor:', error);
        setEditorLoaded(true);
      }
    };
    loadEditor();
  }, []);

  // Detect dark mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkDarkMode = () => {
        const isDark = document.documentElement.classList.contains('dark') || 
                      window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(isDark);
      };

      checkDarkMode();

      // Listen for theme changes
      const observer = new MutationObserver(checkDarkMode);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      });

      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', checkDarkMode);

      return () => {
        observer.disconnect();
        mediaQuery.removeEventListener('change', checkDarkMode);
      };
    }
  }, []);

  const handleEditorChange = (_event: unknown, editor: Editor) => {
    const enhancedEditor = editor as EditorWithExtras;
    onChange(enhancedEditor.getData());
  };

  if (!isClient || !editorLoaded) {
    return (
      <div className={`border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 transition-colors duration-200 ${className}`}>
        <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-800 p-8">
          <div className="text-gray-500 dark:text-gray-400">در حال بارگذاری ویرایشگر...</div>
        </div>
      </div>
    );
  }

  return (
     <div className={`border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 transition-colors duration-200 ${className}`}>
      {ClassicEditor != null ? (
        <CKEditor
          editor={ClassicEditor as never}
          config={editorConfiguration}
          data={value}
          onReady={(editor: Editor) => {
            const enhancedEditor = editor as EditorWithExtras;
            // ست کردن ارتفاع به صورت واکنش‌گرا
            const editableElement = enhancedEditor.ui.view.editable.element;
            if (editableElement) {
              editableElement.style.minHeight = `${getResponsiveHeight()}px`;
            }

            // Apply dark theme styles to editor
            const editorElement = enhancedEditor.ui.view.editable.element;
            const toolbarElement = enhancedEditor.ui.view.toolbar.element;
            
            if (editorElement) {
              if (isDarkMode) {
                editorElement.style.backgroundColor = '#1f2937';
                editorElement.style.color = '#f9fafb';
                editorElement.style.borderColor = '#374151';
                if (toolbarElement) {
                  toolbarElement.style.backgroundColor = '#374151';
                  toolbarElement.style.borderColor = '#4b5563';
                }
              } else {
                editorElement.style.backgroundColor = '#ffffff';
                editorElement.style.color = '#000000';
                editorElement.style.borderColor = '#c4c4c4';
                if (toolbarElement) {
                  toolbarElement.style.backgroundColor = '#f8f9fa';
                  toolbarElement.style.borderColor = '#c4c4c4';
                }
              }
            }

            // آپدیت ارتفاع وقتی ریسایز شد
            const handleResize = () => {
              const editable = enhancedEditor.ui.view.editable.element;
              if (editable) {
                editable.style.minHeight = `${getResponsiveHeight()}px`;
              }
            };
            
            window.addEventListener('resize', handleResize);
            
            // Cleanup function
            return () => {
              window.removeEventListener('resize', handleResize);
            };
          }}
          onChange={handleEditorChange}
        />
      ) : null}
    </div>
  );
}
