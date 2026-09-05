import { AuthLayout } from "@/components/auth";

export const metadata = {
  title: "Altrivo — Authentication",
  description: "Sign in or create your Altrivo vendor account",
};

export default function AuthRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayout>{children}</AuthLayout>;
}
