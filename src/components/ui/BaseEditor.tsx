'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

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

let ClassicEditor: any = null;

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
      return window.innerWidth < 768 ? 200 : 400; // Mobile: 200px, Desktop: 500px
    }
    return 400;
  };

  // Base64 Upload Adapter (برای آپلود تصویر)
  class Base64UploadAdapter {
    loader: any;
    constructor(loader: any) {
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

  function uploadPlugin(editor: any) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
      return new Base64UploadAdapter(loader);
    };
  }

  const editorConfiguration = {
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
  };

  useEffect(() => {
    setIsClient(true);
    const loadEditor = async () => {
      try {
        const editorModule = await import('@ckeditor/ckeditor5-build-classic');
        ClassicEditor = editorModule.default;
        setEditorLoaded(true);
      } catch (error) {
        console.error('Failed to load CKEditor:', error);
        setEditorLoaded(true);
      }
    };
    loadEditor();
  }, []);

  const handleEditorChange = (_event: any, editor: any) => {
    onChange(editor.getData());
  };

  if (!isClient || !editorLoaded) {
    return (
      <div className={`border border-gray-300 dark:border-gray-600 rounded-lg ${className}`}>
        <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-800 p-8">
          <div className="text-gray-500 dark:text-gray-400">در حال بارگذاری ویرایشگر...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`border border-gray-300 dark:border-gray-600 rounded-lg ${className}`}>
      {ClassicEditor && (
        <CKEditor
          editor={ClassicEditor}
          config={editorConfiguration}
          data={value}
          onReady={(editor: any) => {
            // ست کردن ارتفاع به صورت واکنش‌گرا
            editor.ui.view.editable.element.style.minHeight = `${getResponsiveHeight()}px`;

            // آپدیت ارتفاع وقتی ریسایز شد
            window.addEventListener('resize', () => {
              editor.ui.view.editable.element.style.minHeight = `${getResponsiveHeight()}px`;
            });
          }}
          onChange={handleEditorChange}
        />
      )}
    </div>
  );
}
