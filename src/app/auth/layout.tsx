import "../globals.css";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="font-sans bg-background text-primary min-h-screen flex items-center justify-center">
      {children}
    </div>
  );
} 
