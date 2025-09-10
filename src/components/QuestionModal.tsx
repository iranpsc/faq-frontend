'use client';

import { useState, useEffect } from 'react';
import { BaseModal } from './ui/BaseModal';
import { BaseInput } from './ui/BaseInput';
import { BaseSelect } from './ui/BaseSelect';
import { BaseEditor } from './ui/BaseEditor';
import { BaseButton } from './ui/BaseButton';
import { useQuestions } from '@/hooks/useQuestions';
import { useCategories } from '@/hooks/useCategories';
import { useTags } from '@/hooks/useTags';
import { Question, Category, Tag } from '@/services/types';

interface QuestionModalProps {
  visible: boolean;
  questionToEdit?: Question | null;
  onClose: () => void;
  onQuestionCreated?: (question: Question) => void;
  onQuestionUpdated?: (question: Question) => void;
}

interface FormData {
  id: string | null;
  category: Category | null;
  title: string;
  content: string;
  tags: Tag[];
}

export function QuestionModal({
  visible,
  questionToEdit,
  onClose,
  onQuestionCreated,
  onQuestionUpdated,
}: QuestionModalProps) {
  const [form, setForm] = useState<FormData>({
    id: null,
    category: null,
    title: '',
    content: '',
    tags: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const {
    isSubmitting,
    createQuestion,
    updateQuestion,
  } = useQuestions();

  const {
    categories,
    fetchCategoriesPaginated,
  } = useCategories();

  const {
    tags,
    addTag,
    createTag,
  } = useTags();

  const isEditMode = !!form.id;

  // Populate form when questionToEdit changes
  useEffect(() => {
    if (questionToEdit) {
      setForm({
        id: questionToEdit.id,
        title: questionToEdit.title || '',
        content: questionToEdit.content || '',
        category: questionToEdit.category ? {
          ...questionToEdit.category,
          created_at: (questionToEdit.category as any).created_at || new Date().toISOString(),
          updated_at: (questionToEdit.category as any).updated_at || new Date().toISOString(),
        } : null,
        tags: questionToEdit.tags || [],
      });
    } else {
      resetForm();
    }
  }, [questionToEdit]);

  const resetForm = () => {
    setForm({
      id: null,
      category: null,
      title: '',
      content: '',
      tags: [],
    });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.category) {
      newErrors.category = 'لطفا دسته‌بندی را انتخاب کنید';
    }

    if (!form.title.trim()) {
      newErrors.title = 'لطفا عنوان سوال را وارد کنید';
    }

    // Check if content has actual text (not just HTML tags)
    const textContent = form.content.replace(/<[^>]*>/g, '').trim();
    if (!textContent) {
      newErrors.content = 'لطفا شرح سوال را وارد کنید';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || isSubmitting) {
      return;
    }

    const questionData = {
      title: form.title.trim(),
      content: form.content, // Keep HTML content as is
      category_id: form.category!.id,
      tags: form.tags.map(tag => tag.id),
    };

    try {
      let result;
      if (isEditMode) {
        result = await updateQuestion(form.id!, questionData);
      } else {
        result = await createQuestion(questionData);
      }

      if (result.success && result.data) {
        // Show success message (you can implement a toast notification here)
        alert(`سوال شما با موفقیت ${isEditMode ? 'ویرایش' : 'ثبت'} شد.`);
        
        resetForm();
        onClose();
        
        if (isEditMode) {
          onQuestionUpdated?.(result.data);
        } else {
          onQuestionCreated?.(result.data);
        }
      } else {
        // Show error message
        alert(result.error || 'خطایی رخ داده است');
      }
    } catch (error) {
      alert('خطایی رخ داده است');
    }
  };

  const handleFetchCategories = async (page: number, search?: string) => {
    const result = await fetchCategoriesPaginated(page, search);
    if (!result.success) {
      alert(result.error || 'خطا در بارگذاری دسته‌بندی‌ها');
    }
  };

  const handleFetchTags = async (page: number, search?: string) => {
    // This would be implemented if you have a paginated tags API
    // For now, we'll just return success
    // Note: This function should return void, not an object
  };

  const handleAddTag = async (tagName: string) => {
    const newTag = await addTag(tagName);
    if (newTag) {
      setForm(prev => ({
        ...prev,
        tags: [...prev.tags, newTag],
      }));
    }
  };

  const handleCategoryChange = (category: Category | null) => {
    setForm(prev => ({ ...prev, category }));
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: '' }));
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, title: e.target.value }));
    if (errors.title) {
      setErrors(prev => ({ ...prev, title: '' }));
    }
  };

  const handleContentChange = (content: string) => {
    setForm(prev => ({ ...prev, content }));
    if (errors.content) {
      setErrors(prev => ({ ...prev, content: '' }));
    }
  };

  const handleTagsChange = (tags: Tag[] | null) => {
    setForm(prev => ({ ...prev, tags: tags || [] }));
  };

  return (
    <BaseModal
      visible={visible}
      title={isEditMode ? 'ویرایش سوال' : 'سوال خود را وارد کنید'}
      subtitle="مشخصات مربوط به سوال خود را در کادرهای زیر وارد کنید."
      size="4xl"
      closable={true}
      closeOnBackdrop={true}
      closeOnEscape={true}
      onClose={onClose}
      footer={
        <BaseButton
          type="submit"
          form="question-form"
          disabled={isSubmitting}
          className="px-6 py-2"
        >
          {isSubmitting ? (
            `در حال ${isEditMode ? 'ویرایش' : 'ثبت'}...`
          ) : (
            `${isEditMode ? 'ویرایش سوال' : 'ثبت سوال'}`
          )}
        </BaseButton>
      }
    >
      <div className="overflow-y-auto max-h-[60vh]" style={{ direction: 'rtl' }}>
        <form onSubmit={handleSubmit} id="question-form">
          <div className="space-y-6">
            {/* Category */}
            <div>
              <BaseSelect<Category>
                value={form.category}
                options={categories}
                onChange={handleCategoryChange as any}
                label="دسته بندی"
                placeholder="انتخاب دسته بندی"
                searchable={true}
                paginated={true}
                pageSize={10}
                onFetchMore={handleFetchCategories}
                error={errors.category}
                required
              />
            </div>

            {/* Title */}
            <div>
              <BaseInput
                id="title"
                value={form.title}
                onChange={handleTitleChange}
                label="عنوان سوال"
                placeholder="عنوان سوال خود را وارد کنید..."
                error={errors.title}
                required
              />
            </div>

            {/* Content */}
            <div>
              <BaseEditor
                value={form.content}
                onChange={handleContentChange}
                label="شرح سوال"
                mode="full"
                imageUpload={true}
                error={errors.content}
                height={300}
              />
            </div>

            {/* Tags */}
            <div>
              <BaseSelect<Tag>
                value={form.tags}
                options={tags}
                onChange={handleTagsChange as any}
                label="برچسب ها"
                placeholder="برای سوال خود برچسب وارد کنید..."
                multiple={true}
                taggable={true}
                onTagAdd={handleAddTag}
                searchable={true}
                paginated={true}
                pageSize={10}
                onFetchMore={handleFetchTags}
                error={errors.tags}
              />
              <p className="text-xs text-gray-500 mt-1">
                مثال: سوالی درباره کود مناسب درختان نوشته اید پس برچسب ها
                میتواند (کود مناسب، تغذیه درختان، مواد غذایی برای درخت، کود برای رشد درخت، رشد بهتر درخت)
                باشد.
              </p>
            </div>
          </div>
        </form>
      </div>
    </BaseModal>
  );
}
