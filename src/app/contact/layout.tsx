export default async function CitizensLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      className="flex  bg-grayLight"
      dir="rtl"
    >
      <div
        className={`w-full xs:px-1 lg:mt-0`}
      >
        {children}
      </div>
    </main>
  );
}