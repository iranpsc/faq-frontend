import TagContent from '@/components/TagContent';
import { apiService } from '@/services/api';
import Script from 'next/script';
import { Metadata } from 'next';

interface TagPageProps {
  params: { slug: string };
}

export const dynamic = 'force-dynamic';

// تابع برای متادیتای داینامیک
export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { slug } = params;
  try {
    const tagData = await apiService.getTagQuestionsServer(slug, 1);
    const tag = tagData.tag;
    const questions = tagData.data || [];

    const title = tag ? `سوالات برچسب "${tag.name}" - سوالات متداول` : `برچسب "${slug}" - سوالات متداول`;
    const description = tag
      ? `مشاهده ${questions.length} سوال مرتبط با برچسب "${tag.name}" در سیستم سوالات متداول.`
      : `مشاهده سوالات مرتبط با برچسب "${slug}" در سیستم سوالات متداول.`;

    return {
      title,
      description,
      keywords: `${tag?.name || slug}, برچسب, سوالات متداول, FAQ`,
      openGraph: { title, description, type: 'website' },
      twitter: { card: 'summary_large_image', title, description },
    };
  } catch {
    return {
      title: 'سوالات برچسب',
      description: 'مشاهده سوالات برچسب‌ها در سیستم سوالات متداول',
      keywords: 'برچسب, تگ, سوالات متداول, FAQ',
    };
  }
}

export default async function TagPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  try {
    const tagData = await apiService.getTagQuestionsServer(slug, 1);
    const questions = tagData.data || [];
    const tag = tagData.tag || null;
    const pagination = tagData.meta || null;

    // JSON-LD Schema
    const schema = questions.length > 0 ? {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": questions.map(q => ({
        "@type": "Question",
        "name": q.title,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": q.answer || "پاسخی ثبت نشده است."
        }
      }))
    } : null;

    return (
      <>
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
/>

        <TagContent
          slug={slug}
          initialQuestions={questions}
          initialTag={tag}
          initialPagination={pagination}
        />
      </>
    );
  } catch {
    return (
      <TagContent 
        slug={slug}
        initialQuestions={[]}
        initialTag={null}
        initialPagination={null}
      />
    );
  }
}
