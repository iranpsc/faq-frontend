import { Suspense } from "react";
import { ActivityPageContent } from "./ActivityPageContent";
import { apiService } from "@/services/api";
import {
  DailyActivity,
  ActivityApiResponse,
  ActivityGroupedData,
  ActivityPagination,
} from "@/services/types";

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
          url: "/main-logo.png",
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
      images: ["/main-logo.png"],
    },
  };
}

export default async function ActivityPage() {
  // 🟢 گرفتن دیتا SSR
  const response = await apiService.getActivity({
    limit: 30,
    offset: 0,
  }) as ActivityApiResponse;

  const activities: DailyActivity[] = response.success ? (response.data ?? []) : [];

  const groupedActivities: ActivityGroupedData = response.success && response.grouped_data
    ? response.grouped_data
    : activities.reduce<ActivityGroupedData>((acc, activity) => {
        if (activity.month) {
          if (!acc[activity.month]) {
            acc[activity.month] = [];
          }
          acc[activity.month].push(activity);
        }
        return acc;
      }, {});

  const pagination: ActivityPagination | null = response.pagination ?? null;

  // 🟢 فقط Schema: ItemList
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "فعالیت‌های کاربران",
    description: "لیست سوالات، پاسخ‌ها و نظرات کاربران در انجمن",
    itemListElement: activities.map((activityItem, index) => {
      let itemType: "Article" | "Question" | "Answer" | "Comment" = "Article";
      if (activityItem.type === "question") itemType = "Question";
      if (activityItem.type === "answer") itemType = "Answer";
      if (activityItem.type === "comment") itemType = "Comment";

      return {
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": itemType,
          name: activityItem.description,
          author: {
            "@type": "Person",
            name: activityItem.user_name,
            // 🟢 لینک پروفایل کاربر برای رفع خطای "Missing field 'url'"
            url: activityItem.user_url
              ? `https://example.com${activityItem.user_url}`
              : "https://example.com/users/unknown",
          },
          datePublished: activityItem.created_at,
          url: activityItem.url
            ? `https://example.com${activityItem.url}`
            : "https://example.com/activities",
          ...(activityItem.category_name && {
            about: {
              "@type": "Thing",
              name: activityItem.category_name,
            },
          }),
        },
      };
    }),
  };

  return (
    <>
      {/* 🟢 تزریق JSON-LD فقط ItemList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListSchema),
        }}
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
          initialPagination={pagination}
        />
      </Suspense>
    </>
  );
}
