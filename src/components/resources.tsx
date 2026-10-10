import { Link } from "@tanstack/react-router";
import { ArrowRight, Play } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useEffect, useState } from "react";
import { usePublishedContent } from "@/hooks/use-content";
import { youtubeId, type Article, type GalleryImage, type Video } from "@/lib/content";
import { jsonLd, siteUrl } from "@/lib/seo";
import { PageBanner, ContactStrip, SectionLabel } from "./dlfly-site";
import { Reveal } from "./reveal";

export function ArticleCards({ articles }: { articles: Article[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <Reveal
          key={article.id}
          className="overflow-hidden rounded-xl border border-border bg-card"
        >
          <Link to="/articles/$slug" params={{ slug: article.slug }} className="group block">
            <img
              src={article.coverUrl}
              alt=""
              width={600}
              height={400}
              loading="lazy"
              className="aspect-[3/2] w-full object-cover"
            />
            <div className="p-6">
              <p className="text-xs font-bold uppercase tracking-wide text-primary">
                {article.category}
              </p>
              <h2 className="mt-3 font-display text-xl font-extrabold leading-snug group-hover:text-primary">
                {article.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{article.excerpt}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary">
                Read article <ArrowRight className="size-4" />
              </span>
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}

export function ArticlesPage({ initial }: { initial: Article[] }) {
  const { items, error } = usePublishedContent("articles", initial);
  return (
    <>
      <PageBanner
        eyebrow="DLFLY insights"
        title="Practical guidance for your next chapter."
        description="Explore articles on study planning, visa preparation, residency orientation and education finance."
      />
      <section>
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6">
          {error && (
            <p role="status" className="mb-6 text-sm text-muted-foreground">
              {error}
            </p>
          )}
          {items.length ? (
            <ArticleCards articles={items} />
          ) : (
            <p className="py-10 text-center text-muted-foreground">
              New articles are on their way. Contact our team for guidance today.
            </p>
          )}
        </div>
      </section>
      <ContactStrip />
    </>
  );
}

export function ArticlePage({ article }: { article: Article }) {
  return (
    <article>
      <div className="mx-auto max-w-4xl px-5 py-14 sm:px-6">
        <Link to="/articles" className="text-sm font-semibold text-primary">
          ← All articles
        </Link>
        <p className="mt-8 text-xs font-bold uppercase tracking-widest text-primary">
          {article.category}
        </p>
        <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight sm:text-5xl">
          {article.title}
        </h1>
        <p className="mt-5 text-lg leading-8 text-muted-foreground">{article.excerpt}</p>
        <p className="mt-4 text-sm text-muted-foreground">By DLFLY Overseas</p>
        <img
          src={article.coverUrl}
          alt=""
          width={1200}
          height={800}
          className="mt-8 aspect-[16/9] w-full rounded-xl object-cover"
        />
        <div className="article-content mt-10">
          <ReactMarkdown>{article.body}</ReactMarkdown>
        </div>
        <div className="mt-12 rounded-xl bg-secondary p-6">
          <h2 className="font-display text-xl font-extrabold">Discuss your next steps.</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Our team can help turn your questions into a practical preparation plan.
          </p>
          <a
            href="https://wa.me/916304636998"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex min-h-11 items-center rounded-md bg-primary px-5 font-semibold text-primary-foreground"
          >
            Talk to DLFLY Overseas
          </a>
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd({
              "@context": "https://schema.org",
              "@type": "Article",
              headline: article.title,
              description: article.excerpt,
              image: new URL(article.coverUrl, siteUrl).href,
              author: { "@type": "Organization", name: "DLFLY Overseas" },
              mainEntityOfPage: siteUrl + "/articles/" + article.slug,
              ...(article.updatedAt ? { dateModified: article.updatedAt } : {}),
            }),
          }}
        />
      </div>
    </article>
  );
}

export function GalleryPage({ initial }: { initial: GalleryImage[] }) {
  const { items, error } = usePublishedContent("gallery", initial);
  return (
    <>
      <PageBanner
        eyebrow="Our gallery"
        title="A closer look at the journey."
        description="Explore images shared by DLFLY Overseas, from education planning to the preparation behind your next step."
      />
      <section>
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6">
          {error && (
            <p role="status" className="mb-6 text-sm text-muted-foreground">
              {error}
            </p>
          )}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((image) => (
              <Reveal key={image.id}>
                <figure className="overflow-hidden rounded-xl border border-border bg-card">
                  <a
                    href={image.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open image: ${image.title}`}
                  >
                    <img
                      src={image.imageUrl}
                      alt={image.alt}
                      loading="lazy"
                      width={800}
                      height={600}
                      className="aspect-[4/3] w-full object-cover"
                    />
                  </a>
                  <figcaption className="p-5">
                    <h2 className="font-display text-lg font-extrabold">{image.title}</h2>
                    {image.caption && (
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">
                        {image.caption}
                      </p>
                    )}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
          {!items.length && (
            <p className="py-10 text-center text-muted-foreground">
              New gallery images will appear here soon.
            </p>
          )}
        </div>
      </section>
      <ContactStrip />
    </>
  );
}

function VideoEmbed({ video }: { video: Video }) {
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const id = youtubeId(video.youtubeUrl);
  if (!id) return null;
  return (
    <Reveal className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="relative aspect-video bg-primary">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
            title={video.title}
            className="size-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <button
            disabled={!ready}
            data-video-id={id}
            onClick={() => setPlaying(true)}
            className="group relative grid size-full place-items-center overflow-hidden text-white"
            aria-label={`Play video: ${video.title}`}
          >
            <img
              src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
              alt=""
              loading="lazy"
              className="absolute inset-0 size-full object-cover opacity-65"
            />
            <span className="relative grid size-16 place-items-center rounded-full bg-white text-primary shadow-lg transition-transform group-hover:scale-105">
              <Play className="size-7" />
            </span>
          </button>
        )}
      </div>
      <div className="p-6">
        <h2 className="font-display text-xl font-extrabold">{video.title}</h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">{video.description}</p>
      </div>
    </Reveal>
  );
}

export function VideosPage({ initial }: { initial: Video[] }) {
  const { items, error } = usePublishedContent("videos", initial);
  return (
    <>
      <PageBanner
        eyebrow="DLFLY video library"
        title="Watch. Understand. Plan your next step."
        description="Watch videos selected by our team to support your education and preparation journey. Choose a video to load its YouTube player."
      />
      <section>
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6">
          {error && (
            <p role="status" className="mb-6 text-sm text-muted-foreground">
              {error}
            </p>
          )}
          <div className="grid gap-7 md:grid-cols-2">
            {items.map((video) => (
              <VideoEmbed key={video.id} video={video} />
            ))}
          </div>
          {!items.length && (
            <div>
              <SectionLabel>Keep exploring</SectionLabel>
              <h2 className="font-display text-2xl font-extrabold">
                Start with the topics that matter to you.
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Our video library is being prepared. Explore these practical guides while new videos
                are added.
              </p>
              <div className="mt-6 grid gap-5 md:grid-cols-3">
                {[
                  {
                    to: "/study-abroad",
                    title: "Your study abroad plan",
                    image: "/images/dlfly-study.jpg",
                    text: "Discover the steps from course shortlisting to preparing for campus life.",
                  },
                  {
                    to: "/visa",
                    title: "Your visa preparation",
                    image: "/images/dlfly-visa.jpg",
                    text: "Understand how to organise documents, deadlines and your next questions.",
                  },
                  {
                    to: "/education-loans",
                    title: "Your education budget",
                    image: "/images/dlfly-finance.jpg",
                    text: "Prepare a useful overview of tuition, living costs and funding timelines.",
                  },
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to as "/study-abroad" | "/visa" | "/education-loans"}
                    className="overflow-hidden rounded-2xl border border-border bg-card"
                  >
                    <img
                      src={item.image}
                      alt=""
                      width={600}
                      height={400}
                      loading="lazy"
                      className="aspect-[16/10] w-full object-cover"
                    />
                    <div className="p-5">
                      <h3 className="font-display text-lg font-extrabold">{item.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.text}</p>
                      <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary">
                        Explore the guide <ArrowRight className="size-4" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
      <ContactStrip />
    </>
  );
}
