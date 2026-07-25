import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Instagram Graph API webhook receiver.
 *
 * Not required for the reels showcase (src/services/instagram.ts polls on an
 * hourly ISR revalidate instead) — this exists only because the Meta app
 * dashboard's setup wizard offers it. Instagram's webhook fields don't include
 * a "new media published" event (only comments/mentions/story_insights/
 * messages), so this can't reliably drive real-time reel updates; it best-
 * effort revalidates the reels cache on any verified event, which is a bonus,
 * not a guarantee.
 *
 * GET  — Meta's one-time subscription verification handshake.
 * POST — receives event payloads; verifies the request actually came from
 *        Meta via the X-Hub-Signature-256 HMAC before doing anything.
 *
 * Env vars required:
 *   INSTAGRAM_WEBHOOK_VERIFY_TOKEN  must match the "Verify token" pasted into
 *                                   the Meta app dashboard's webhook config
 *   INSTAGRAM_APP_SECRET            the app's secret, for signature checks
 */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const expected = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN;

  if (mode === 'subscribe' && expected && token === expected && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(request: Request) {
  const appSecret = process.env.INSTAGRAM_APP_SECRET;
  const signatureHeader = request.headers.get('x-hub-signature-256');
  const rawBody = await request.text();

  if (!appSecret || !signatureHeader) {
    return NextResponse.json({ received: false }, { status: 401 });
  }

  const expectedSignature = 'sha256=' + createHmac('sha256', appSecret).update(rawBody).digest('hex');
  const signatureBuffer = Buffer.from(signatureHeader);
  const expectedBuffer = Buffer.from(expectedSignature);

  const isValid =
    signatureBuffer.length === expectedBuffer.length && timingSafeEqual(signatureBuffer, expectedBuffer);

  if (!isValid) {
    return NextResponse.json({ received: false }, { status: 401 });
  }

  // Best-effort: refresh the cached reels list in case this event happens to
  // be media-related (see file header — not guaranteed for new posts).
  revalidateTag('instagram-reels', 'max');

  return NextResponse.json({ received: true });
}
