// app/activities/page.tsx
import { Suspense } from "react";
import { ActivityPageContent } from "./ActivityPageContent";
import { apiService } from "@/services/api";

export async function generateMetadata() {
  return {
    title: "فعالیت‌ها | انجمن",
    description: "لیست آخرین فعالیت‌ها شامل سوالات، پاسخ‌ها و نظرات کاربران.",
    openGraph: {
      title: "فعالیت‌ها | انجمن",
      description: "آخرین فعالیت‌های کاربران شامل سوال، پاسخ و نظر",
      url: "https://example.com/activities",
      siteName: "انجمن من",
      images: [
        {
          url: "https://faqhub.ir/main-logo.png",
          width: 1200,
          height: 630,
          alt: "فعالیت‌ها",
        },
      ],
      locale: "fa_IR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "فعالیت‌ها",
      description: "آخرین فعالیت‌های کاربران انجمن",
      images: ["https://faqhub.ir/main-logo.png"],
    },
  };
}

export default async function ActivityPage() {
  // 🟢 گرفتن دیتا SSR
  const response = await apiService.getActivity({
    months: 3,
    offset: 0,
    questions_limit: 5, // بهتره تعداد کم باشه چون QAPage
    answers_limit: 3,
    comments_limit: 0, // ❌ Comment توی Rich Result ساپورت نمی‌شه
  });

  const activities = response.success ? response.data : [];

  // 🟢 ساختن اسکیمای داینامیک (QAPage)
  const questions = activities
    .filter((a: any) => a.type === "question")
    .map((q: any) => {
      const answers = activities.filter(
        (a: any) => a.type === "answer" && a.parent_id === q.id
      );

      return {
        "@type": "Question",
        name: q.title || q.description,
        text: q.description,
        author: {
          "@type": "Person",
          name: q.user_name,
        },
        dateCreated: q.created_at,
        url: q.url ? `https://example.com${q.url}` : "https://example.com/activities",
        answerCount: answers.length,
        ...(answers.length > 0 && {
          acceptedAnswer: {
            "@type": "Answer",
            text: answers[0].description,
            dateCreated: answers[0].created_at,
            author: {
              "@type": "Person",
              name: answers[0].user_name,
            },
            url: answers[0].url
              ? `https://example.com${answers[0].url}`
              : "https://example.com/activities",
          },
        }),
        ...(answers.length > 1 && {
          suggestedAnswer: answers.slice(1).map((ans: any) => ({
            "@type": "Answer",
            text: ans.description,
            dateCreated: ans.created_at,
            author: {
              "@type": "Person",
              name: ans.user_name,
            },
            url: ans.url
              ? `https://example.com${ans.url}`
              : "https://example.com/activities",
          })),
        }),
      };
    });

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "QAPage",
    mainEntity: questions,
  };

  return (
    <>
      {/* 🟢 تزریق JSON-LD Schema داینامیک */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <Suspense
        fallback={
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                در حال بارگذاری فعالیت‌ها...
              </p>
            </div>
          </div>
        }
      >
        <ActivityPageContent
          initialActivities={activities}
          initialGroupedActivities={{}}
        />
      </Suspense>
    </>
  );
}
