import { ArrowRight, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { HOMEPAGE_LINKS } from '@/config/homepage-links';

const INSTAGRAM_POSTS = [
  { id: 1, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUJGvMSZgwIlLwahFRrdxRLmFixcgBdkuNq3df9UHJ-K8OUa4HoheieBXDpqxPjerp-dQPGsKjSf_agZAUvvC4MUShS8orWlerj4ZLkEcfstV4yii_FfGR2mMq_vHCdAF9Rw_CLrXow-CxkgL031EdkyyO1_53j78G2TEOBk7Cx0P7vSpDYY7aHY-zbcyrV0_bEccY9eRDJToErv7tsejp21p2y-pYcuRYJUGlpe-5ltfcYvCHjNoofA', url: HOMEPAGE_LINKS.instagram.posts[0].url },
  { id: 2, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDYiRCc0SOXT-IyTldErTn73a7AMNwjKtfeA6qAjlNRKkflCEuJCYmv5G7MPkJOcEixO3y_InfY4EdHbRCSYjEmHnnLAIXVWP4fr35ncMCdzByzS2gbo4cva11sGetzCwvrIkkJihh-Ee0CFX-V0wak_hUweISm4jzCboLIGFMtX42uwgFxMeKHr5nnkLZ5hqABidyQMU1mt_g97E6wbxFQezC7ls_V8aXsczxyMxzKW5Wxbb5KY0xkNw', url: HOMEPAGE_LINKS.instagram.posts[1].url },
  { id: 3, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgYShAiK_WIPmW8XzCj504v1jLWuG1cfWTnZsg933i2ucADqVunBR1qG5SLt6vnry3FMYd5IjpuhbkkvpxbiBxVKdw1xPl-_cypjd1BUkgfnLWl5Z2bOp_Ch46lWO9hlVuedtU4st5dLRYuHi67StD9Fie2aQXNqIQLW4Bo1gwfo8_dl16zt-SlIi0eD1QdfaWRkmCg9NsIJWLg6avXY2r9HuoLEivcUOSNR8r0dkjK-reWSX-Jr0odA', url: HOMEPAGE_LINKS.instagram.posts[2].url },
  { id: 4, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVPG_NxUQQz2Jcu8HJfHRV12nWworIMPWOwMwvagcRprZYeT3xBcfW_m56h-jz47MSacfFos8eF5cUqojKD_4Ui0IXROEqeX_jdhGR2gWp899esWEZFiQiiHoYxF8Pxxfl5sjr2empr26C_Vav7rZEOb0atBAwUYdbrdxBr-jkdrLpGWtw8OwxHGYAcXHrUnDrOJd0bUINio6hgZvL8Cl5P1RP0njtEvhdkqjpAXHKOnMCoeIrxSGYSQ', url: HOMEPAGE_LINKS.instagram.posts[3].url },
  { id: 5, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0B8jnp9RnFqSKJf7RhfDW0RMWRFeKtE6Pro0qHEZ3-OqDgYMdAQFtklxD3iqkM2NvFC4vw8xci53SgwgchVm9OZ46OF6Jy8khtzYLDAPL55tZs2XykE-E_MGUfz3PGcQlTP44Pjr1lataW2LSyANIknycYTeucy2cOa_CZ-o-lyKLpmQJ8dUqXY7YK3kOE5YC_RZuxpoppp8sNHufLfXCSpms7cnyQiqQAqHLY7mi3zv9vf-U2yFu2g', url: HOMEPAGE_LINKS.instagram.posts[4].url },
];

export function InstagramFeed() {
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
          {INSTAGRAM_POSTS.map((post) => (
            <Link key={post.id} href={post.url} className="group relative w-[250px] tablet:w-[300px] aspect-square rounded-xl overflow-hidden snap-center shrink-0 shadow-sm hover:shadow-xl transition-shadow duration-500">
              <Image
                src={post.image}
                alt="Instagram post"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-charcoal-navy/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="flex items-center gap-2 text-pearl-white">
                  <ShoppingBag className="font-light text-3xl" />
                  <span className="font-label-md uppercase tracking-widest text-sm font-semibold">Shop Look</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
