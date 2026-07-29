import dynamic from "next/dynamic";
import { generateMetadata } from "@/lib/seo/generateMetadata";
import {
  AboutHero,
  OurStory,
  BrandPhilosophy,
  WhyChooseUs,
  QualityPromise,
  AboutCTA,
} from "@/components/about/AboutSections";

const FounderIntro = dynamic(() => import("@/components/home/FounderIntro").then((m) => m.FounderIntro));
const Testimonials = dynamic(() => import("@/components/home/Testimonials").then((m) => m.Testimonials));

export const metadata = generateMetadata({
  title: "About AG Elements | Premium 925 Sterling Silver Jewellery",
  description: "Discover AG Elements. Premium 925 sterling silver jewellery offering timeless style and everyday luxury.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="flex flex-col w-full">
      <AboutHero />
      <FounderIntro ctaHref="/shop" ctaLabel="Explore Our Jewellery" />
      <OurStory />
      <BrandPhilosophy />
      <WhyChooseUs />
      <QualityPromise />
      <Testimonials />
      <AboutCTA />
    </div>
  );
}
