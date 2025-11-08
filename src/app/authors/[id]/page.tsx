import { Suspense } from 'react';
import { Metadata } from 'next';
import { apiService } from '@/services/api';
import { AuthorDetailPageContent } from './AuthorDetailPageContent';
import { Question, User } from '@/services/types';

interface AuthorDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: AuthorDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const authorId = resolvedParams.id;

  try {
    const author = await apiService.getAuthorServer(authorId);

    const title = ` سوالات پرسیده شده توسط | ${author.name ?? 'نویسنده'} `;
    const authorBio = typeof author.bio === 'string' ? author.bio : undefined;
    const description = authorBio && authorBio.trim()
      ? authorBio
      : `مطالب و فعالیت‌های ${author.name ?? 'نویسنده'}`;

    const baseUrl = 'https://faqhub.ir';
    const url = `${baseUrl}/authors/${author.id}`;

    // --- 1) اعتبارسنجی avatar: فقط اگر واقعا string باشد استفاده می‌کنیم
    const avatar =
      typeof author.avatar === 'string' && author.avatar.trim().length > 0
        ? author.avatar.trim()
        : undefined;

    // --- 2) ساخت آرایه او‌جی‌ایمِیج با تایپ پایدار
    type OpenGraphImages = NonNullable<NonNullable<Metadata['openGraph']>['images']>;
    const openGraphImages: OpenGraphImages | undefined = avatar
      ? [{ url: avatar, alt: author.name ?? undefined }]
      : undefined;

    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: {
        title,
        description,
        url,
        type: 'profile',
        images: openGraphImages,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        // twitter.images بعضی ورژن‌ها string[] می‌خوان، بعضی‌ها OGImage[] — این ساده‌ترین امن‌ترین حالت:
        images: avatar ? [avatar] : undefined,
      },
    };
  } catch {
    return {
      title: 'نویسنده یافت نشد',
      description: 'نویسنده مورد نظر وجود ندارد یا حذف شده است.',
    };
  }
}


type AuthorSchemaQuestion = Question & { answer?: string };

function AuthorSchema({ author, questions }: { author: User; questions: AuthorSchemaQuestion[] }) {
  const authorDescription = typeof author.bio === 'string' ? author.bio : '';
  const authorAvatar = typeof author.avatar === 'string' ? author.avatar : '';

  const authorSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": author.name,
    "description": authorDescription,
    "image": authorAvatar,
    "url": `https://faqhub.ir/authors/${author.id}`,
    "mainEntityOfPage": `https://faqhub.ir/authors/${author.id}`,
  };


  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": questions.map((q) => ({
      "@type": "Question",
      "name": q.title, // سوال
      "acceptedAnswer": {
        "@type": "Answer",
        "text": q.answer || q.content || "پاسخ این سؤال در صفحه موجود است.", // پاسخ
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(authorSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}

// ✅ صفحه اصلی
export default async function AuthorDetailPage({ params, searchParams }: AuthorDetailPageProps) {
  const resolvedParams = await params;
  const searchParamsData = await searchParams;
  const authorId = resolvedParams.id;
  const page = parseInt(searchParamsData.page || '1', 10);

  try {
    const [authorResponse, questionsResponse] = await Promise.all([
      apiService.getAuthorServer(authorId),
      apiService.getAuthorQuestionsServer(authorId, page),
    ]);

    const questions: AuthorSchemaQuestion[] = questionsResponse.data || [];

    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">در حال بارگذاری...</p>
            </div>
          </div>
        }
      >
        <AuthorSchema author={authorResponse} questions={questions} />
        <AuthorDetailPageContent
          initialAuthor={authorResponse}
          initialQuestions={questions}
          initialPagination={questionsResponse.meta}
          authorId={authorId}
        />
      </Suspense>
    );
  } catch (error) {
    console.error('Error fetching author data:', error);

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            نویسنده یافت نشد
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            نویسنده مورد نظر وجود ندارد یا حذف شده است.
          </p>
        </div>
      </div>
    );
  }
}
