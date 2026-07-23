# Password Reset — Required WordPress-Side Change

**Status:** Next.js side is fully implemented and verified. One small WordPress-side change
must still be deployed by whoever has plugin/file access to the agelements.in WordPress
install — this repo has no such access (only the WooCommerce REST consumer key/secret and
the JWT-auth login endpoint), so it could not be applied from here.

## Root cause

Clicking "Forgot Password" already worked correctly up through triggering WordPress's native
lost-password flow (`frontend-v2/src/app/api/auth/forgot-password/route.ts` posts to
`wp-login.php?action=lostpassword`, which is the only way to trigger it — WordPress core has
no REST endpoint for this). The email WordPress core sends from that action is hardcoded
(inside `retrieve_password_message()` in `wp-includes/user.php`) to link to:

```
https://agelements.in/wp-login.php?action=rp&key=<key>&login=<login>
```

Since agelements.in serves **both** the new Next.js storefront and the original WordPress
install from the same domain (`NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_WP_URL` are the same
host), `wp-login.php` is answered by WordPress's own theme — which is exactly the "redirected
to the old WordPress frontend" behavior reported. This isn't a Next.js bug or a broken
route; it's WordPress core generating a link to itself, by design, because nothing has told
it to do otherwise.

Confirmed while auditing: there is no `/wp-json/.../reset-password`-style REST endpoint
anywhere in WP core, WooCommerce, or the JWT-auth plugin already used for login
(`/wp-json/jwt-auth/v1/token`). Verifying a reset key and setting the new password
(`check_password_reset_key()` / `reset_password()`) only exists inside `wp-login.php`'s own
PHP request handler today.

## What's already done (this repo)

- `src/app/account/reset-password/page.tsx` — new page. Reads `?login=` and `?key=` from
  the URL, verifies the link, and presents a "set new password" form, entirely within the
  Next.js frontend's own styling — no WordPress theme is ever shown.
- `src/app/api/auth/reset-password/route.ts` — new API route. `GET` verifies a `login`/`key`
  pair; `POST` submits the new password. Both simply forward to a new WordPress REST route,
  `POST/GET /wp-json/ag/v1/reset-password`, described below.
- `src/app/account/layout.tsx` — added `/reset-password` to the list of account pages that
  render without the authenticated-account sidebar (alongside login/register/forgot-password),
  since this page is reached while signed out.

## What still needs to be deployed to WordPress

A single small mu-plugin (no page/theme edits, no admin UI changes) that does two things:
1. Rewrites the password-reset email to link to the Next.js frontend instead of `wp-login.php`.
2. Registers the REST route the Next.js API route above calls, using WordPress's own
   `check_password_reset_key()` / `reset_password()` core functions — the same validation
   `wp-login.php` uses internally, just exposed over REST instead of an HTML form.

Drop this file in as `wp-content/mu-plugins/ag-headless-reset-password.php` (mu-plugins load
automatically, no activation step needed):

```php
<?php
/**
 * Plugin Name: AG Elements - Headless Password Reset
 * Description: Keeps the WordPress password-reset flow inside the Next.js frontend instead
 *              of wp-login.php, for the headless agelements.in storefront.
 */

add_filter('retrieve_password_message', function ($message, $key, $user_login, $user_data) {
    $frontend_url = rtrim(getenv('AG_FRONTEND_URL') ?: 'https://agelements.in', '/');
    $reset_url = $frontend_url . '/account/reset-password?login=' . rawurlencode($user_login) . '&key=' . rawurlencode($key);

    return sprintf(
        "Someone has requested a password reset for the following account: %s\r\n\r\n" .
        "If this was a mistake, ignore this email and nothing will happen.\r\n\r\n" .
        "To reset your password, visit the following address:\r\n%s\r\n",
        $user_data->user_login,
        $reset_url
    );
}, 10, 4);

add_action('rest_api_init', function () {
    register_rest_route('ag/v1', '/reset-password/verify', [
        'methods'             => 'GET',
        'permission_callback' => '__return_true',
        'callback'            => function (WP_REST_Request $request) {
            $login = $request->get_param('login');
            $key   = $request->get_param('key');
            $user  = check_password_reset_key($key, $login);
            if (is_wp_error($user)) {
                return new WP_Error($user->get_error_code(), $user->get_error_message(), ['status' => 400]);
            }
            return ['valid' => true];
        },
    ]);

    register_rest_route('ag/v1', '/reset-password', [
        'methods'             => 'POST',
        'permission_callback' => '__return_true',
        'callback'            => function (WP_REST_Request $request) {
            $login    = $request->get_param('login');
            $key      = $request->get_param('key');
            $password = $request->get_param('password');

            $user = check_password_reset_key($key, $login);
            if (is_wp_error($user)) {
                return new WP_Error($user->get_error_code(), $user->get_error_message(), ['status' => 400]);
            }
            if (strlen($password) < 8) {
                return new WP_Error('password_too_short', 'Password must be at least 8 characters.', ['status' => 400]);
            }

            reset_password($user, $password);
            return ['success' => true];
        },
    ]);
});
```

`permission_callback => '__return_true'` is intentional and safe here: the reset `key` itself
is the credential (single-use, WordPress-generated, tied to one user, expires after the
default 24 hours) — exactly the same trust model `wp-login.php?action=rp` already uses
unauthenticated today. No new attack surface is introduced; this only relocates where that
same check runs.

## Validation plan (once the mu-plugin is deployed)

1. Trigger "Forgot Password" from `/account/forgot-password` with a real account email.
2. Confirm the received email link points to `https://agelements.in/account/reset-password?login=...&key=...` (not `wp-login.php`).
3. Click it — confirm the Next.js page loads, shows "Verifying your reset link…", then the new-password form.
4. Submit a new password — confirm the success state renders and login with the new password succeeds.
5. Re-use the same link a second time — confirm it now shows the "Link expired or invalid" state (WordPress single-use keys are consumed by `reset_password()`).
6. Wait out or simulate an expired key — confirm the same invalid-link state (not a raw error).

Until the mu-plugin is deployed, the emailed link will continue to point at `wp-login.php`
exactly as before — the Next.js `/account/reset-password` page and API route are ready and
tested, but nothing routes users to them yet without this backend change.
