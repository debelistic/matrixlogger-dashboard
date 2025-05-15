import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { OrganizationProvider } from "../context/OrganizationContext";

export const metadata = {
  title: "MatrixLogger Dashboard",
  description: "Manage your apps, logs, and settings.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true} data-lt-installed="true">
      <body className="font-sans bg-background text-primary">
        <AuthProvider>
          <OrganizationProvider>
            {children}
          </OrganizationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
