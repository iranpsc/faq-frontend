
// app/questions/[slug]/page.tsx
import { Metadata } from "next"
import { cache } from "react"
import { apiService } from "@/services/api"
import QuestionDetailsContent from "@/components/QuestionDetailsContent"
import { Answer, Question } from "@/services/types"

// Cache the question fetch to avoid duplicate API calls
const getQuestion = cache(async (slug: string) => {
  return await apiService.getQuestionBySlugServer(slug);
});

// Cache the answers fetch
const getAnswers = cache(async (questionId: string) => {
  return await apiService.getQuestionAnswersServer(questionId);
});

export const revalidate = 300; // Revalidate every 5 minutes

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const question = await getQuestion(slug)

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
          url: "/main-logo.png",
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

export default async function QuestionDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  
  // Use cached question fetch (deduplicates with generateMetadata)
  const question: Question = await getQuestion(slug)
  
  // Fetch answers using cached function
  const answersResponse = await getAnswers(question.id)
  const answers: Answer[] = answersResponse?.data || []

  // Optimized clean function - use plain text from backend if available
  const clean = (text: string) => {
    // If text is already plain (no HTML tags), return as is
    if (!text.includes('<')) return text.trim();
    // Otherwise do minimal processing
    return text.replace(/<[^>]*>/g, "").trim();
  };

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
      .filter((answer) => answer.is_correct)
      .map((answer) => ({
        "@type": "Answer",
        text: clean(answer.content),
        dateCreated: answer.created_at,
        url: `https://faqhub.ir/questions/${slug}#answer-${answer.id}`,
        upvoteCount: answer.votes_count || 0, // 👈 اضافه شد
        author: {
          "@type": "Person",
          name: answer.user?.name || "کاربر ناشناس",
          ...(answer.user?.image_url ? { image: answer.user.image_url } : {}),
        },
      })),
    suggestedAnswer: answers
      .filter((answer) => !answer.is_correct)
      .slice(0, 3)
      .map((answer) => ({
        "@type": "Answer",
        text: clean(answer.content),
        dateCreated: answer.created_at,
        url: `https://faqhub.ir/questions/${slug}#answer-${answer.id}`,
        upvoteCount: answer.votes_count || 0, // 👈 اضافه شد
        author: {
          "@type": "Person",
          name: answer.user?.name || "کاربر ناشناس",
          ...(answer.user?.image_url ? { image: answer.user.image_url } : {}),
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

