import { generateMetadata as getSeoMetadata } from "@/lib/seo/generateMetadata";

export const metadata = getSeoMetadata({
  title: "Contact Us | AG Elements",
  description: "Get in touch with AG Elements for questions about orders, sterling silver care, or custom jewelry requests. We're here to help.",
  path: "/contact",
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
