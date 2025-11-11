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
      <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg border border-gray-300">
        <div className="text-gray-500">در حال بارگذاری ویرایشگر...</div>
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

  const getResponsiveHeight = () => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 ? 200 : 400;
    }
    return 400;
  };

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
            reader.addEventListener('load', () => resolve({ default: reader.result }));
            reader.addEventListener('error', () => reject(reader.error));
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
    styles: `
      .ck-editor__editable {
        background-color: #ffffff !important;
        color: #000000 !important;
        border: 1px solid #c4c4c4 !important;
        resize: none !important;
        overflow: auto !important;
        min-height: ${getResponsiveHeight()}px !important;
        height: ${getResponsiveHeight()}px !important;
      }
      .ck-editor__main {
        background-color: #ffffff !important;
      }
      .ck-toolbar {
        background-color: #f8f9fa !important;
        border: 1px solid #c4c4c4 !important;
      }
      .ck-button {
        color: #000000 !important;
      }
      .ck-button:hover {
        background-color: #e5e7eb !important;
      }
      .ck-button.ck-on {
        background-color: #d1d5db !important;
        color: #000000 !important;
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

  const handleEditorChange = (_event: unknown, editor: Editor) => {
    const enhancedEditor = editor as EditorWithExtras;
    onChange(enhancedEditor.getData());
  };

  if (!isClient || !editorLoaded) {
    return (
      <div className={`border border-gray-300 rounded-lg bg-white transition-colors duration-200 ${className}`}>
        <div className="flex items-center justify-center bg-gray-50 p-8">
          <div className="text-gray-500">در حال بارگذاری ویرایشگر...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`border border-gray-300 rounded-lg bg-white transition-colors duration-200 ${className}`}>
      {ClassicEditor && (
        <CKEditor
          editor={ClassicEditor as never}
          config={editorConfiguration}
          data={value}
          onReady={(editor: Editor) => {
            const enhancedEditor = editor as EditorWithExtras;
            const editableElement = enhancedEditor.ui.view.editable.element;
            const toolbarElement = enhancedEditor.ui.view.toolbar.element;

            if (editableElement) {
              const height = getResponsiveHeight();
              editableElement.style.height = `${height}px`;
              editableElement.style.minHeight = `${height}px`;
              editableElement.style.resize = 'none';
              editableElement.style.overflow = 'auto';
              editableElement.style.backgroundColor = '#ffffff';
              editableElement.style.color = '#000000';
              editableElement.style.borderColor = '#c4c4c4';
            }

            if (toolbarElement) {
              toolbarElement.style.backgroundColor = '#f8f9fa';
              toolbarElement.style.borderColor = '#c4c4c4';
            }

            // جلوگیری از کاهش ارتفاع در فوکوس
            const observer = new MutationObserver(() => {
              if (editableElement) {
                const height = getResponsiveHeight();
                editableElement.style.height = `${height}px`;
                editableElement.style.minHeight = `${height}px`;
              }
            });
            observer.observe(editableElement!, { attributes: true, attributeFilter: ['style'] });

            const handleResize = () => {
              const height = getResponsiveHeight();
              if (editableElement) {
                editableElement.style.height = `${height}px`;
                editableElement.style.minHeight = `${height}px`;
              }
            };

            window.addEventListener('resize', handleResize);
            return () => {
              window.removeEventListener('resize', handleResize);
              observer.disconnect();
            };
          }}
          onChange={handleEditorChange}
        />
      )}
    </div>
  );
}
