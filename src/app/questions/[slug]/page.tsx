
// app/questions/[slug]/page.tsx
import { Metadata } from "next"
import { apiService } from "@/services/api"
import QuestionDetailsContent from "@/components/QuestionDetailsContent"

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const slug = params.slug
  const question = await apiService.getQuestionBySlugServer(slug)

  const title = question?.title || "سؤال بدون عنوان"
  const description = question?.content
    ?.replace(/<[^>]*>/g, "")
    .slice(0, 160)
    .trim() || "پرسش و پاسخ در مورد موضوعات مختلف در FAQHub"
  const url = `https://faqhub.ir/questions/${slug}`

  return {
    title: `${title} | FAQHub`,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "article",
      locale: "fa_IR",
      siteName: "FAQHub",
      images: [
        {
          url: question?.user?.image_url || "https://faqhub.ir/default-thumbnail.jpg",
          width: 800,
          height: 600,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [question?.user?.image_url || "https://faqhub.ir/default-thumbnail.jpg"],
    },
    alternates: {
      canonical: url,
    },
  }
}

export default async function QuestionDetailsPage({ params }: { params: { slug: string } }) {
  const slug = params.slug
  const question = await apiService.getQuestionBySlugServer(slug)
  const answersResponse = await apiService.getQuestionAnswersServer(question.id)
  const answers = answersResponse?.data || []

  const clean = (text: string) => text?.replace(/<[^>]*>/g, "").trim()

const qaSchema = {
  "@context": "https://schema.org",
  "@type": "QAPage",
  mainEntity: {
    "@type": "Question",
    name: question?.title || "",
    text: clean(question?.content || ""),
    dateCreated: question?.created_at || "",
    url: `https://faqhub.ir/questions/${slug}`,
    upvoteCount: question?.votes_count || 0, // 👈 اضافه شد
    author: {
      "@type": "Person",
      name: question?.user?.name || "کاربر ناشناس",
      ...(question?.user?.image_url ? { image: question.user.image_url } : {}),
    },
    answerCount: answers.length,
    acceptedAnswer: answers
      .filter((a: any) => a.is_correct)
      .map((a: any) => ({
        "@type": "Answer",
        text: clean(a.content),
        dateCreated: a.created_at,
        url: `https://faqhub.ir/questions/${slug}#answer-${a.id}`,
        upvoteCount: a.votes_count || 0, // 👈 اضافه شد
        author: {
          "@type": "Person",
          name: a.user?.name || "کاربر ناشناس",
          ...(a.user?.image_url ? { image: a.user.image_url } : {}),
        },
      })),
    suggestedAnswer: answers
      .filter((a: any) => !a.is_correct)
      .slice(0, 3)
      .map((a: any) => ({
        "@type": "Answer",
        text: clean(a.content),
        dateCreated: a.created_at,
        url: `https://faqhub.ir/questions/${slug}#answer-${a.id}`,
        upvoteCount: a.votes_count || 0, // 👈 اضافه شد
        author: {
          "@type": "Person",
          name: a.user?.name || "کاربر ناشناس",
          ...(a.user?.image_url ? { image: a.user.image_url } : {}),
        },
      })),
  },
}


  return (
    <>
      {/* متا و اسکیما */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(qaSchema) }}
      />

      {/* محتوای اصلی */}
      <QuestionDetailsContent
        slug={slug}
        initialQuestion={question}
        initialAnswers={answers}
      />
    </>
  )
}

