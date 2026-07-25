// Fetches the latest Reels for the AG Elements Instagram Business account via
// the Instagram Graph API ("Instagram API with Instagram Login" — no linked
// Facebook Page required). Configure via env vars:
//   INSTAGRAM_ACCESS_TOKEN        long-lived IG access token
//   INSTAGRAM_BUSINESS_ACCOUNT_ID the IG professional account's numeric ID
// Without both set, this quietly returns [] so the homepage still renders —
// callers fall back to static content rather than fabricating reel data.

// Bump periodically — Meta retires each version ~2 years after release.
const GRAPH_API_VERSION = 'v25.0';
const MEDIA_FIELDS = 'id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp';

export interface InstagramReel {
  id: string;
  permalink: string;
  thumbnailUrl: string;
  videoUrl: string;
  caption: string | null;
}

interface GraphMediaItem {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_product_type?: 'AD' | 'FEED' | 'REELS' | 'STORY';
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
}

export async function getInstagramReels(limit = 6): Promise<InstagramReel[]> {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const businessAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

  if (!accessToken || !businessAccountId) {
    return [];
  }

  try {
    const url = `https://graph.instagram.com/${GRAPH_API_VERSION}/${businessAccountId}/media?fields=${MEDIA_FIELDS}&limit=25&access_token=${accessToken}`;
    const res = await fetch(url, { next: { revalidate: 3600, tags: ['instagram-reels'] } });

    if (!res.ok) {
      console.error(`Failed to fetch Instagram media: ${res.status} ${res.statusText}`);
      return [];
    }

    const json: { data?: GraphMediaItem[] } = await res.json();

    return (json.data ?? [])
      .filter((item) => item.media_product_type === 'REELS' && item.media_url)
      .slice(0, limit)
      .map((item) => ({
        id: item.id,
        permalink: item.permalink,
        thumbnailUrl: item.thumbnail_url || item.media_url!,
        videoUrl: item.media_url!,
        caption: item.caption ?? null,
      }));
  } catch (error) {
    console.error('Failed to fetch Instagram reels', error);
    return [];
  }
}
