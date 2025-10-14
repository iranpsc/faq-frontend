import HomeContent from '@/components/HomeContent';
import { apiService } from '@/services/api';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const title = "انجمن حم - بزرگترین انجمن پرسش و پاسخ ایران";
  const description = "پرسش و پاسخ درباره موضوعات مختلف در بزرگترین انجمن ایران. سوالات خود را بپرسید و پاسخ‌ها را مشاهده کنید.";
  const url = "https://faqhub.ir";

  return {
    title,
    description,
    alternates: {
      canonical: url
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "انجمن حم",
      type: "website",
      images: [
        {
          url: "https://faqhub.ir/main-logo.png",
          width: 200,
          height: 200,
          alt: "تیم متاورس رنگ",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    }
  };
}

export default async function Home() {
  try {
    const [questionsData, activeUsers] = await Promise.all([
      apiService.getQuestionsServer(),
      apiService.getActiveUsersServer(5)
    ]);

    const initialQuestions = questionsData.data || [];
    const initialPaginationMeta = questionsData.meta || null;

    const topQuestions = initialQuestions.slice(0, 5);

    const siteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "url": "https://faqhub.ir",
      "name": "انجمن حم",
      "description": "بزرگترین انجمن پرسش و پاسخ ایران",
      "publisher": {
        "@type": "Organization",
        "name": "انجمن حم",
        "url": "https://faqhub.ir"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://faqhub.ir/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": topQuestions
        .filter(q => q.title && q.content) // حذف سوالات ناقص
        .map(q => ({
          "@type": "Question",
          "name": q.title.trim(),
          "url": `https://faqhub.ir/questions/${q.slug}`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": q.content
              ? q.content.replace(/<[^>]*>/g, '').trim().substring(0, 500)
              : "پاسخ این سوال هنوز ثبت نشده است."
          }
        }))
    };

    return (
      <>
        {/* Schema SSR */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />

        <HomeContent
          initialQuestions={initialQuestions}
          initialPaginationMeta={initialPaginationMeta}
          initialActiveUsers={activeUsers}
        />
      </>
    );
  } catch {
    return (
      <HomeContent
        initialQuestions={[]}
        initialPaginationMeta={null}
        initialActiveUsers={[]}
      />
    );
  }
}
