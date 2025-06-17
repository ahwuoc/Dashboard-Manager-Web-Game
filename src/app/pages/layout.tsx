export default function LayoutPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen w-full bg-cover bg-center flex justify-center items-start p-4"
      style={{
        backgroundImage:
          "url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1fCk4CIFFgVKpjd9ZmmAaSqrCPDkRfnMJGA&s')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        imageRendering: "auto",
      }}
    >
      <div className="w-full min-h-screen max-w-5xl bg-[#fbe2c1] border border-gray-600 rounded-lg shadow-lg p-6">
        {children}
      </div>
    </div>
  );
}
