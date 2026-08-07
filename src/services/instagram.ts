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

// media_url/thumbnail_url are Meta-signed CDN links, not permanent asset URLs —
// Meta does not guarantee how long they stay valid, so this cache window has
// to stay well inside that (unknown, but observed short) lifetime. 3600s was
// long enough for visitors to be served an already-expired link; 300s trades
// a bit more Graph API traffic for that no longer happening in practice.
const REELS_REVALIDATE_SECONDS = 300;

const LOG_PREFIX = '[instagram-reels]';

// Meta's error body, e.g. { error: { message: "API access deactivated.",
// type: "OAuthException", code: 200, fbtrace_id: "..." } }. Distinct Graph
// error codes need distinct remediation — 190 is an expired/invalid token
// (refresh it), 200 can mean the app's API access itself was deactivated in
// the Meta Developer Dashboard (no token refresh fixes that) — so the code
// is logged rather than collapsed into a generic "fetch failed" message.
interface GraphErrorBody {
  error?: { message?: string; type?: string; code?: number; fbtrace_id?: string };
}

// A "successful" cached response can still be stale beyond use: Next's fetch
// cache keeps serving the last good payload indefinitely once revalidation
// starts failing (confirmed in production — a 9-day-old cached response with
// 100% expired signed media URLs was still being served as if live).
// media_url/thumbnail_url are short-lived signed CDN links, so checking the
// first reel's thumbnail is a reliable, cheap proxy for "is this whole batch
// (signed together) still usable" without re-hitting the Graph API itself.
async function isMediaStillReachable(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD', cache: 'no-store', signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getInstagramReels(limit = 6): Promise<InstagramReel[]> {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const businessAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

  if (!accessToken || !businessAccountId) {
    console.warn(`${LOG_PREFIX} not configured — INSTAGRAM_ACCESS_TOKEN/INSTAGRAM_BUSINESS_ACCOUNT_ID missing, falling back to static content`);
    return [];
  }

  try {
    const url = `https://graph.instagram.com/${GRAPH_API_VERSION}/${businessAccountId}/media?fields=${MEDIA_FIELDS}&limit=25&access_token=${accessToken}`;
    const res = await fetch(url, { next: { revalidate: REELS_REVALIDATE_SECONDS, tags: ['instagram-reels'] } });

    if (!res.ok) {
      const graphError: GraphErrorBody['error'] = await res.json().then((body: GraphErrorBody) => body?.error).catch(() => undefined);

      console.error(`${LOG_PREFIX} Graph API request failed`, {
        httpStatus: res.status,
        httpStatusText: res.statusText,
        graphErrorCode: graphError?.code,
        graphErrorType: graphError?.type,
        graphErrorMessage: graphError?.message,
        fbtraceId: graphError?.fbtrace_id,
      });
      return [];
    }

    const json: { data?: GraphMediaItem[] } = await res.json();

    const reels = (json.data ?? [])
      .filter((item) => item.media_product_type === 'REELS' && item.media_url)
      .slice(0, limit)
      .map((item) => ({
        id: item.id,
        permalink: item.permalink,
        thumbnailUrl: item.thumbnail_url || item.media_url!,
        videoUrl: item.media_url!,
        caption: item.caption ?? null,
      }));

    if (reels.length === 0) {
      console.warn(`${LOG_PREFIX} Graph API call succeeded but returned zero REELS items`, {
        totalItemsReturned: json.data?.length ?? 0,
      });
      return reels;
    }

    if (!(await isMediaStillReachable(reels[0].thumbnailUrl))) {
      console.warn(`${LOG_PREFIX} cached reel data's signed media URLs appear expired — treating as unavailable so the homepage falls back to static content instead of dead media`, {
        reelId: reels[0].id,
      });
      return [];
    }

    return reels;
  } catch (error) {
    console.error(`${LOG_PREFIX} Unexpected error calling Graph API`, error);
    return [];
  }
}
