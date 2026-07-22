import { generateMetadata as getSeoMetadata } from "@/lib/seo/generateMetadata";

export const metadata = getSeoMetadata({
  title: "Digital Gift Cards | AG Elements",
  description: "Shop AG Elements digital gift cards in flexible denominations, delivered by email so your recipient can choose their own sterling silver jewelry.",
  path: "/gifting/gift-cards",
});

export default function GiftCardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
