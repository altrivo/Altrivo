import Link from "next/link";
import { Button } from "@/components/shared";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-muted p-6 text-center font-sans">
      <div className="w-full max-w-md space-y-5">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-primary-500 flex items-center justify-center text-on-primary font-bold font-display text-2xl shadow-md">
          404
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-heading font-display">
          Page Not Found
        </h1>
        <p className="text-sm font-medium text-body">
          The page or store resource you are looking for does not exist or has been moved.
        </p>
        <div className="pt-2">
          <Link href="/">
            <Button variant="primary" size="md" className="font-bold">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
