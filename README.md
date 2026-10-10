# DLFLY Overseas

React and TanStack Start website for study abroad, visa guidance, visit visas, dependent visas, permanent residency orientation and education finance. Service pages include preparation steps, checklists and FAQs. The public interface combines deep navy, red and gold with warm neutral backgrounds, full-width hero images and solid text panels. Shared colour surfaces in `src/styles.css` keep text and controls readable across the country tiles, service cards, process sections and contact areas. The Framer Motion mobile menu overlays the hero. Enquiries, articles, gallery images, YouTube videos and site settings are managed through Firebase at `/admin`.

Enquiries: +91 6304636998 and dlflyoverseas@gmail.com. The footer credits [Octaleads](https://www.octaleads.com).

## Local development

Use Node.js 22.12 or newer and Bun. Copy `.env.example` to `.env.local`, then fill the Firebase web configuration from the company's Firebase console. These are public frontend configuration values, not service-account credentials. Never commit passwords, access tokens or service-account keys.

```sh
bun install --frozen-lockfile
bun run dev
```

Shared brochure presentation lives in `src/components/dlfly-site.tsx`. Public pages use file-based routes and server-render published Firestore content. Visible pages refresh content every minute and when the browser window regains focus. Unpublished records are accessible only to the approved admin.

The homepage and Study Abroad page share `StudyDestinations`, with all countries defined in `src/data/study-destinations.ts`. United Kingdom, United States, Canada, Australia and New Zealand appear first, followed by the European destinations. Country links open a WhatsApp enquiry with the selected country. National flag SVGs in `public/images/flags/` are downloaded from [Flagcdn](https://flagcdn.com/) using its [documented ISO country codes](https://flagpedia.net/download/api), based on Wikimedia Commons vectors. Flags retain their original proportions and are country identifiers, not government endorsements or university partnership logos.

On phones below 640 px, study destinations use four compact cards per row with centered flags and country names. Tablet and desktop layouts retain their existing three and four columns. All cards retain their full accessible country labels and WhatsApp enquiry links. Floating contact controls sit side by side on phones to reduce their vertical footprint. They hide while the enquiry section is visible so fields and submission controls remain clear; the section includes its own contact links.

Public page sections and the footer share gold borders, curved corners and responsive side gutters through `.site-public` section variables in `src/styles.css`. Inner containers retain comfortable reading widths. Top-level animated sections use the `site-section` class; the mobile menu overlays the framed hero, with photos remaining above the copy on phones and tablets.

Service Overview and “Your process, step by step” sections use the unchanged background image from the [AWS homepage hero](https://aws.amazon.com/), saved locally as `public/images/service-overview-aws.png` at the user's request. The [original AWS asset](https://d1.awsstatic.com/onedam/marketing-channels/website/aws/en_US/homepage/hero/cloud-capablilities-2.c6901489b1b64b289e0c7eee10a2bba93165573b.png) was retrieved on 9 October 2026. Translucent introductory panels and navy process cards maintain text contrast over the illustration.

Visit Visa (`/visit-visa`) and Dependent Visa (`/dependent-visa`) each use the shared service layout, with their own hero photo, preparation steps, checklist and FAQs. General preparation content follows official visitor and dependant guidance, including [GOV.UK visitor information](https://www.gov.uk/standard-visitor) and [GOV.UK dependant information](https://www.gov.uk/student-visa/family-members); route-specific eligibility and document requirements must be checked with the relevant authority.

## Firebase and administration

The business project is `dlflyoverseas-18486`, with Firestore in Mumbai (`asia-south1`). Enable the Google authentication provider and add the final deployment hostname to Authentication → Settings → Authorized domains.

```sh
firebase use dlflyoverseas-18486
firebase deploy --only firestore
```

Use the company's account for cloud operations. `firestore.rules` enforces verified Google sign-in by **dlflyoverseas@gmail.com** for content writes and enquiry reads/updates. Visitors may create a strictly validated enquiry but cannot read, update or delete submissions. The browser email check is an additional interface restriction, not the security boundary. `/admin` is excluded from indexing and analytics.

After signing in, expand **Starter content** and choose **Add starter articles and gallery**. It creates three prepared articles, three illustrative gallery entries and default settings only where those documents are missing. Existing records are preserved. Article URLs are fixed after creation. Drafts remain private; publishing, editing and deletion update public content.

Gallery and article images accept HTTPS image URLs or files under `/images/`. Optional Firebase Storage uploads require a bucket, the applicable Firebase billing plan and deployed `storage.rules`. Leave `VITE_ENABLE_STORAGE_UPLOADS=false` until those prerequisites are approved and configured. The optional uploader accepts raster images up to 5 MB.

Videos accept a YouTube URL or video ID. Public players use `youtube-nocookie.com` and load after the visitor presses Play. No unapproved company videos are preloaded. Website settings control the logo, office address, Maps embed URL, analytics IDs and Search Console verification value. The included logo comes from the DLFLY Google business account; replace it with a higher-resolution approved asset when available. The default map searches the company name; set the exact office embed in Settings once confirmed.

## Analytics and search

Set `VITE_SITE_URL` to the actual production origin before building. Canonical links, social metadata, Organization/Article structured data, `/sitemap.xml` and `/robots.txt` use this origin. The sitemap includes published articles and excludes admin pages.

The business integrations are GA4 `G-HZXF3MF7CH` and Microsoft Clarity `yu0nizh9b1`. Configure these through environment variables or admin Settings. Analytics load only after visitor consent; the footer reopens preferences. The site sends one explicit `page_view` per public route with `send_page_view: false` in its Google configuration. **Disable enhanced measurement → Page views → Page changes based on browser history events** to prevent duplicate views. Scrolls, outbound clicks and downloads may remain enabled. The site also sends `contact_click` with a `contact_method` of `whatsapp`, `phone` or `email`, and `video_start` when a visitor opens a YouTube player. It does not treat a contact click as a completed enquiry. Page-view URLs and referrers omit query strings and fragments. Google advertising consent remains denied. Clarity uses Consent V2 and balanced masking.

The primary domain is `https://dlflyoverseas.com`. Cloudflare routes both `@` and `www` to the Vercel-provided CNAME target with DNS-only routing; Vercel permanently redirects `www` to the apex. Zoho email DNS records are preserved. The Search Console Domain property is verified through its Cloudflare TXT record. Keep that verification record, then submit `https://dlflyoverseas.com/sitemap.xml`. The prior Vercel URL-prefix property retains its HTML verification tag. Tracking IDs in code do not by themselves confirm live collection. See [Google’s page-view documentation](https://developers.google.com/analytics/devguides/collection/ga4/views) and [Microsoft’s Consent V2 documentation](https://learn.microsoft.com/en-gb/clarity/setup-and-installation/clarity-consent-api-v2).

The homepage, contact page and all six service pages include a native contact form. Service pages preselect the relevant service. Forms collect name, email, phone, service, destination, message and explicit contact consent; only a successful Firestore write displays confirmation. Failed sends retain the draft. Contact links remain available. No automatic email delivery is configured; submissions are reviewed in the admin inbox. Zoho Forms remains deferred.

The **Enquiries** admin tab subscribes to the latest 100 submissions, newest first, with New, Contacted and Closed filters. The designated admin can read full details, open phone/email links and save a follow-up status and private notes. Original submissions and creation times cannot be edited; closing an enquiry retains its history. Visitors and other accounts cannot retrieve these records. Firestore rules require server-generated timestamps and limit all text lengths and allowed field values. Publish `firestore.rules` before the updated website.

A hidden honeypot discourages basic form bots; it is not server-side rate limiting. Firebase App Check or a server-side abuse-control service can be added if needed. Form contents carry [Clarity's explicit masking attribute](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-masking). After a confirmed save, consenting visitors send GA4 `generate_lead` and Clarity `enquiry_submitted` with the public page path only; no name, email, phone, destination or message is sent in these events. GA4 enhanced form measurement remains disabled. Contact consent does not grant analytics or marketing consent.

## Validation

```sh
bun run typecheck
bun run lint
bun run test
bun run build
bunx playwright install chromium webkit
bun run test:e2e
# Run the same checks against the public deployment:
DLFLY_TEST_ORIGIN=https://dlflyoverseas.com bun run test:e2e
```

The browser suite checks all public pages at desktop, tablet, Android, iPhone/WebKit and 320 px widths, the mobile dropdown without hero movement, content navigation, maps, admin entry, sitemap and robots. Content checks expect the starter articles and gallery to exist in the configured backend.

Install the official Firebase CLI and Java 21 to run the isolated emulator checks:

```sh
bun run test:rules
bun run test:admin
```

Rules tests exercise approved-admin access, anonymous access, other emails/providers, private drafts, invalid data, private enquiries and immutable original submissions. Admin browser tests use the demo Auth/Firestore emulators to check creation, draft privacy, publishing, video embedding, settings, deletion and the visitor-to-inbox enquiry lifecycle; they do not replace a real Google production sign-in test.

## Vercel deployment

Import the updated GitHub repository into the company's Vercel account. `vercel.json` selects TanStack Start, a frozen Bun install, the build command and security headers. Add the `.env.local` configuration to the deployment environment, excluding local emulator flags and any credentials. Confirm the final URL, rebuild with the matching `VITE_SITE_URL`, and add that hostname to Firebase authorized domains.

For a local production preview:

```sh
bun run build
bun run start
```

Nitro emits `.output/server/index.mjs` and `.output/public` locally, and the Vercel build output when running on Vercel. Build artifacts, credentials and local deployment links are ignored by Git.
