import type { ReactNode } from "react";
import Footer from "@/app/components/Footer";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
