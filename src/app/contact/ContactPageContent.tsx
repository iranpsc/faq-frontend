"use client";

import Form from "./components/form";

export default function ContactPageContent() {
  return (
    <div className="flex" dir="rtl">
      <section className="mt-[60px] lg:mt-0">
        <section className="mx-auto px-3 lg:px-9">
          <h1 className="font-rokh font-bold text-[24px] sm:text-[26px] md:text-[28px] lg:text-[30px] xl:text-[32px] text-center dark:text-white md:mt-[64px] mb-[16px]">
            تماس با ما
          </h1>

          <div className="flex flex-col gap-10">
            <div>
              <p className="text-lightGray font-medium text-justify text-sm md:text-lg mt-5 leading-10 px-5 xl:px-20 text-center">
                در انجمن حم، مرزهای گفتگو گشوده می‌شود و شما به دنیایی بی‌پایان
                از پرسش و پاسخ خوش‌آمد می‌گویید. اینجا جایی است که واقعیت با
                اندیشه و تجربه درهم می‌آمیزد و هر پرسش، آغاز یک ماجراجویی تازه
                در مسیر دانستن است.
              </p>
            </div>
          </div>

          <div>
            <main className="overflow-x-hidden w-full bg-gray-100 dark:bg-gray-800 rounded-xl dark:text-white py-5 px-2 md:px-4 lg:p-7 mt-5 md:mt-10">
              <h2 className="lg:text-right text-lg md:text-xl text-black dark:text-white font-bold py-5 text-center">
                فرم تماس
              </h2>
              <div className="flex-col flex gap-7 lg:flex-row w-full">
                {/* فرم */}
                <div className="flex flex-col gap-2 md:gap-6 w-full lg:w-1/2 justify-center">
                  <p className="lg:text-right text-darkGray dark:text-Field py-1 text-center text-sm md:text-base mt-1">
                    پیام شما می‌تواند شروع یک مکالمه سازنده باشد.
                  </p>
                  <Form />
                </div>

                {/* اطلاعات تماس + نقشه */}
                <div className="flex flex-col gap-7 w-full lg:w-1/2 justify-center">
                  <div className="flex flex-col md:flex-row md:flex-wrap w-full items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                      <a
                        className="font-bold text-2xl leading-[40px] text-black dark:text-white font-rokh"
                        href="tel:09120820120"
                      >
                        ۰۹۱۲۰۸۲۰۱۲۰
                      </a>
                    </div>
                    <div className="flex gap-3 text-center lg:text-right">
                      <a
                        className="text-light-newColors-shades-50 dark:text-white font-medium text-[16px] md:text-[25px] leading-[32px] font-rokh"
                        href="mailto:info@rgb.irpsc.com"
                      >
                        info@rgb.irpsc.com
                      </a>
                    </div>
                  </div>

                  <div className="aspect-[5/3.4]">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d12860.972378290073!2d50.0287883!3d36.3064114!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3f8b5551db33af95%3A0xa19dc982418e7204!2sMetaRgb!5e0!3m2!1sen!2s!4v1732341818636!5m2!1sen!2s"
                      style={{ border: "0" }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="w-full h-full rounded-xl"
                      title="نقشه دفتر انجمن حم"
                    ></iframe>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </section>
      </section>
    </div>
  );
}
