"use client";

import { useState } from "react";

export default function ContactForm({ params }: { params?: any }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNo: "",
    title: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/sendEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: [process.env.NEXT_PUBLIC_EMAIL_TO],
          cc: [""],
          bcc: [],
          message: {
            subject: `فرم تماس از طرف ${formData.name}`,
            text: `نام: ${formData.name}\nایمیل: ${formData.email}\nتلفن: ${formData.phoneNo}\nموضوع: ${formData.title}\nپیام: ${formData.message}`,
            html: `
                <p><strong>نام:</strong> ${formData.name}</p>
                <p><strong>ایمیل:</strong> ${formData.email}</p>
                <p><strong>تلفن:</strong> ${formData.phoneNo}</p>
                <p><strong>موضوع:</strong> ${formData.title}</p>
                <p><strong>پیام:</strong> ${formData.message}</p>
              `,
          },
        }),
      });

      const result = await response.json();
      alert(result.message); // جایگزین toast.success
      setFormData({
        name: "",
        email: "",
        phoneNo: "",
        title: "",
        message: "",
      });
    } catch (error) {
      console.error("خطا در ارسال فرم:", error);
      alert("خطایی در ارسال فرم رخ داد. لطفاً دوباره امتحان کنید.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid lg:grid-cols-2 gap-3 md:gap-5 mt-2">
        <div className="flex flex-col gap-3 ">
          <div className="flex flex-col gap-5">
            <input
              type="text"
              className="w-full rtl:text-right h-[50px]  bg-white dark:bg-gray-900 rounded-[10px] p-4 border-0 dark:text-white "
              name="name"
              value={formData.name}
              id="name"
              placeholder="نام و نام خانوادگی"
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="flex flex-col gap-3 ">
          <div className="flex flex-col gap-5">
            <input
              type="tel"
              className="w-full rtl:text-right h-[50px]  bg-white dark:bg-gray-900 rounded-[10px] p-4 border-0 dark:text-white "
              name="phoneNo"
              value={formData.phoneNo}
              id="phoneNo"
              placeholder="شماره تلفن"
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="flex flex-col gap-3 ">
          <div className="flex flex-col gap-5">
            <input
              type="text"
              className="w-full rtl:text-right h-[50px]   bg-white dark:bg-gray-900 rounded-[10px] p-4 border-0 dark:text-white "
              name="email"
              value={formData.email}
              id="email"
              placeholder="پست الکترونیک"
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="flex flex-col gap-3 ">
          <div className="flex flex-col gap-5">
            <input
              type="text"
              className="w-full rtl:text-right h-[50px]   bg-white dark:bg-gray-900 rounded-[10px] p-4 border-0 dark:text-white "
              name="title"
              value={formData.title}
              id="title"
              placeholder="موضوع پیام"
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3 md:gap-5 w-full mt-2 md:mt-5">
        <div className="flex flex-col">
          <textarea
            className="w-full rtl:text-right  bg-white dark:bg-gray-900 rounded-[10px] p-4 border-0 dark:text-white "
            id="message"
            rows={10}
            placeholder="پیام خود را اینجا بنویسید..."
            onChange={handleChange}
            name="message"
            value={formData.message}
          ></textarea>
        </div>
        <button
          type="submit"
          className="mt-[4px] text-[19px] bg-blue-500 dark:bg-dark-yellow dark:text-white w-full text-white font-bold text-center p-4 rounded-[10px] active:scale-105"
        >
          ارسال پیام
        </button>
      </div>
    </form>
  );
}