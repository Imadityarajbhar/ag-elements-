import { generateMetadata as getSeoMetadata } from "@/lib/seo/generateMetadata";

export const metadata = getSeoMetadata({
  title: "Gift Finder | AG Elements",
  description: "Answer a few quick questions and let our interactive gift finder recommend the perfect sterling silver jewelry piece for any occasion.",
  path: "/gifting/finder",
});

export default function GiftFinderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
