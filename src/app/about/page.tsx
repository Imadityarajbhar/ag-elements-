import dynamic from "next/dynamic";
import { generateMetadata } from "@/lib/seo/generateMetadata";
import {
  AboutHero,
  OurStory,
  BrandPhilosophy,
  Craftsmanship,
  WhyChooseUs,
  QualityPromise,
  AboutCTA,
} from "@/components/about/AboutSections";

const FounderIntro = dynamic(() => import("@/components/home/FounderIntro").then((m) => m.FounderIntro));
const Testimonials = dynamic(() => import("@/components/home/Testimonials").then((m) => m.Testimonials));

export const metadata = generateMetadata({
  title: "About AG Elements | Our Heritage & Story",
  description: "Discover the legacy of AG Elements. Crafting timeless 925 sterling silver jewelry since 1954.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="flex flex-col w-full">
      <AboutHero />
      <FounderIntro ctaHref="/shop" ctaLabel="Explore Our Jewellery" />
      <OurStory />
      <BrandPhilosophy />
      <Craftsmanship />
      <WhyChooseUs />
      <QualityPromise />
      <Testimonials />
      <AboutCTA />
    </div>
  );
}
