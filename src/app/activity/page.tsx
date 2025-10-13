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
    questions_limit: 10,
    answers_limit: 8,
    comments_limit: 5,
  });

  const activities = response.success ? response.data : [];

  const groupedActivities: Record<string, any[]> = {};
  activities.forEach((activity: any) => {
    if (activity.month) {
      if (!groupedActivities[activity.month]) {
        groupedActivities[activity.month] = [];
      }
      groupedActivities[activity.month].push(activity);
    }
  });

  // 🟢 ساختن اسکیمای داینامیک بر اساس محتوای ActivityPageContent
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "فعالیت‌های کاربران",
    description: "لیست سوالات، پاسخ‌ها و نظرات کاربران در انجمن",
    itemListElement: activities.map((a: any, index: number) => {
      let itemType = "Article";
      if (a.type === "question") itemType = "Question";
      if (a.type === "answer") itemType = "Answer";
      if (a.type === "comment") itemType = "Comment";

      return {
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": itemType,
          name: a.description,
          author: {
            "@type": "Person",
            name: a.user_name,
          },
          datePublished: a.created_at,
          url: a.url ? `https://example.com${a.url}` : "https://example.com/activities",
          ...(a.category_name && {
            about: {
              "@type": "Thing",
              name: a.category_name,
            },
          }),
        },
      };
    }),
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
          initialGroupedActivities={groupedActivities}
        />
      </Suspense>
    </>
  );
}
