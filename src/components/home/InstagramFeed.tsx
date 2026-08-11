import { ArrowRight, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { HOMEPAGE_LINKS } from '@/config/homepage-links';
import { getInstagramReels } from '@/services/instagram';
import { ReelCard } from './ReelCard';

// Static placeholder tiles — used only as a graceful fallback for as long as
// INSTAGRAM_ACCESS_TOKEN / INSTAGRAM_BUSINESS_ACCOUNT_ID aren't configured, or
// the Graph API call fails (see src/services/instagram.ts), so the section
// never renders empty. Points at real, already-approved brand photography
// already live on the homepage (src/app/page.tsx) rather than the AI
// prototyping-tool host these five tiles previously used — that host isn't a
// production asset store, and this is the one path in the app confirmed
// (via a live build) to actually be rendering right now, since the
// configured Instagram token is currently rejected by the Graph API. Only 2
// tiles rather than the original 5: there are only 2 suitable local images to
// reuse without fabricating new photography — see the Phase 2 report for the
// recommendation to replace this with real "shop the look" photography.
const FALLBACK_POSTS = [
  { id: 1, image: '/collections/bridal-collection.jpg', url: HOMEPAGE_LINKS.instagram.posts[0].url },
  { id: 2, image: '/collections/everyday-stacking.jpg', url: HOMEPAGE_LINKS.instagram.posts[1].url },
];

export async function InstagramFeed() {
  const reels = await getInstagramReels(6);

  return (
    <section className="py-section-v-padding w-full overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-margin-mobile tablet:px-margin-desktop mb-8 text-center">
        <h2 className="font-headline-lg text-[36px] tablet:text-[48px] font-medium text-charcoal-navy mb-2">Shop The Look</h2>
        <p className="font-body-md text-on-surface-variant mb-6">Tag @AGElements to be featured on our feed.</p>
        <Link href={HOMEPAGE_LINKS.instagram.profile} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-label-md text-[14px] uppercase tracking-widest font-semibold text-charcoal-navy hover:text-ag-purple transition-colors">
          <span>Follow Us on Instagram</span>
          <ArrowRight className="text-[18px]" />
        </Link>
      </div>

      <div className="flex w-full overflow-x-auto pb-8 custom-scrollbar snap-x snap-mandatory">
        <div className="flex gap-4 px-margin-mobile tablet:px-margin-desktop min-w-max mx-auto">
          {reels.length > 0 ? (
            reels.map((reel) => <ReelCard key={reel.id} reel={reel} />)
          ) : (
            FALLBACK_POSTS.map((post) => (
              <Link key={post.id} href={post.url} className="group relative w-[250px] tablet:w-[300px] aspect-square rounded-xl overflow-hidden snap-center shrink-0 shadow-sm hover:shadow-xl transition-shadow duration-500">
                <Image
                  src={post.image}
                  alt="Instagram post"
                  fill
                  sizes="(max-width: 767px) 250px, 300px"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-charcoal-navy/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="flex items-center gap-2 text-pearl-white">
                    <ShoppingBag className="font-light text-3xl" />
                    <span className="font-label-md uppercase tracking-widest text-sm font-semibold">Shop Look</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
