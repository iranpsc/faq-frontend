"use client";
import dynamic from "next/dynamic";
import type { User } from "@/services/types";

const UserCard = dynamic(() =>
  import("@/components/UserCard").then((mod) => ({ default: mod.UserCard }))
);

type RawStaticUser = {
  id: number;
  name: string;
  profile_photo: string;
  code: string;
  score: string;
  levels: { current: { name: string } };
};

const rawUsers: RawStaticUser[] = [
  {
    id: 1,
    name: "حسین قدیری",
    profile_photo: "/profile/hossein-ghadiri.jpg",
    code: "HM-2000001",
    score: "",
    levels: { current: { name: "بنیان گذار" } },
  },
  {
    id: 2,
    name: "امیر مدنی فر",
    profile_photo: "",
    code: "HM-2000002",
    score: "",
    levels: { current: { name: "بنیان گذار" } },
  },
  {
    id: 3,
    name: "عباس آجرلو",
    profile_photo: "",
    code: "HM-2000005",
    score: "",
    levels: { current: { name: "توسعه دهنده" } },
  },
  {
    id: 4,
    name: "مهدی غلام حسینی",
    profile_photo: "",
    code: "HM-2000008",
    score: "",
    levels: { current: { name: "توسعه دهنده" } },
  },
  {
    id: 5,
    name: "نازنین حشمتی",
    profile_photo: "",
    code: "",
    score: "",
    levels: { current: { name: "توسعه دهنده" } },
  },
  {
    id: 6,
    name: "امیر محسنی",
    profile_photo: "",
    code: "HM-2000475",
    score: "",
    levels: { current: { name: "توسعه دهنده" } },
  },
  {
    id: 7,
    name: "امین دهقان نژاد",
    profile_photo: "",
    code: "",
    score: "",
    levels: { current: { name: "توسعه دهنده" } },
  },
  {
    id: 8,
    name: "فاطمه نصیری",
    profile_photo: "",
    code: "",
    score: "",
    levels: { current: { name: "توسعه دهنده" } },
  },
  {
    id: 9,
    name: "بنیامین نوری",
    profile_photo: "",
    code: "HM-2000011",
    score: "",
    levels: { current: { name: "توسعه دهنده" } },
  },
  {
    id: 10,
    name: "مصطفی قدیری",
    profile_photo: "",
    code: "",
    score: "",
    levels: { current: { name: "توسعه دهنده" } },
  },
  {
    id: 11,
    name: "محمدجواد گرئی",
    profile_photo: "",
    code: "",
    score: "",
    levels: { current: { name: "توسعه دهنده" } },
  },
  {
    id: 12,
    name: "امیر حسین امینی",
    profile_photo: "",
    code: "HM-2000010",
    score: "",
    levels: { current: { name: "توسعه دهنده" } },
  },
  {
    id: 13,
    name: "آی تای ملکی",
    profile_photo: "",
    code: "",
    score: "",
    levels: { current: { name: "توسعه دهنده" } },
  },
  {
    id: 14,
    name: "یوسف خدری",
    profile_photo: "",
    code: "",
    score: "",
    levels: { current: { name: "توسعه دهنده" } },
  },
  {
    id: 15,
    name: "پرهام امین لو",
    profile_photo: "",
    code: "",
    score: "",
    levels: { current: { name: "توسعه دهنده" } },
  },
  {
    id: 16,
    name: "محمدرضا اصغری",
    profile_photo: "",
    code: "",
    score: "",
    levels: { current: { name: "توسعه دهنده" } },
  },
  {
    id: 17,
    name: "مرضیه ثاقب علیزاده",
    profile_photo: "",
    code: "HM-2000003",
    score: "",
    levels: { current: { name: "توسعه دهنده" } },
  },
  {
    id: 18,
    name: "سعید زاجکانی",
    profile_photo: "",
    code: "HM-2000009",
    score: "",
    levels: { current: { name: "توسعه دهنده" } },
  },
  {
    id: 19,
    name: "پارسا بهرامی",
    profile_photo: "",
    code: "HM-2000491",
    score: "",
    levels: { current: { name: "توسعه دهنده" } },
  },
];

const defaultCreatedAt = "2024-01-01T00:00:00.000Z";

const staticUsers: User[] = rawUsers.map(({ id, name, profile_photo, code, score, levels }) => ({
  id: id.toString(),
  name,
  image_url: profile_photo || undefined,
  online: false,
  created_at: defaultCreatedAt,
  score: score ? Number(score) : 0,
  level_name: levels.current?.name,
  profile_photo,
  code,
  levels,
}));

export default function AboutList() {
  return (
    <div className="flex flex-row flex-wrap justify-center md:justify-center w-full no-scrollbar overflow-y-auto py-[20px]">
      {staticUsers.map((item) => (
        <UserCard
          key={item.id}
          user={item}
          className="min-w-[260px]"
        />
      ))}
    </div>
  );
}
