"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { fetchBlogPostBySlug, BlogPost } from "@/services/api";
import {
  Calendar,
  Clock,
  ChevronRight,
  Eye,
  Share2,
  Check,
  ArrowLeft,
  Sparkles,
  Loader2,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";

export default function BlogPostDetailPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "";

  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let isMounted = true;
    async function loadPost() {
      setIsLoading(true);
      try {
        const res = await fetchBlogPostBySlug(slug);
        if (isMounted) {
          setPost(res.data);
          setRelated(res.related);
        }
      } catch (err) {
        console.warn("Failed to load article:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadPost();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareTwitter = () => {
    if (typeof window !== "undefined" && post) {
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(`${post.title} via @CarplugNG`);
      window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, "_blank");
    }
  };

  const handleShareWhatsApp = () => {
    if (typeof window !== "undefined" && post) {
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(`*${post.title}*\n\nRead more on Carplug: ${url}`);
      window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-32 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
          <p className="text-sm font-medium">Loading article details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 max-w-3xl mx-auto px-4 py-24 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Article Not Found</h2>
          <p className="text-sm text-gray-500 mt-2">
            The article you are searching for does not exist or may have been archived.
          </p>
          <Link
            href="/blog"
            className="mt-6 inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Blog</span>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500">
          <Link href="/" className="hover:text-emerald-700 transition">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <Link href="/blog" className="hover:text-emerald-700 transition">
            Blog
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-800 font-semibold truncate max-w-[200px] sm:max-w-md">
            {post.category?.name || "Editorial"}
          </span>
        </nav>

        {/* Article Header */}
        <header className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              {post.category?.name || "Automotive Insights"}
            </span>
            {post.featured && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                Featured
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-[1.15]">
            {post.title}
          </h1>

          {/* Author & Telemetry Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-gray-200 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                {post.authorName ? post.authorName.charAt(0) : "C"}
              </div>
              <div>
                <div className="font-bold text-gray-900">{post.authorName}</div>
                <div className="text-xs text-gray-500">{post.authorRole || "Automotive Writer"}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Recently Published"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{post.readTime}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-gray-400" />
                <span>{(post.viewsCount || 0).toLocaleString()} views</span>
              </div>
            </div>
          </div>
        </header>

        {/* Featured Cover Image */}
        <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-3xl overflow-hidden bg-gray-100 shadow-md">
          <Image
            src={post.coverImage}
            alt={post.coverImageAlt || post.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 896px"
            className="object-cover object-center"
          />
        </div>

        {/* Article Body Content */}
        <article className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
          {/* Excerpt Lead In */}
          <div className="text-base sm:text-lg font-medium text-gray-800 leading-relaxed italic border-l-4 border-emerald-600 pl-4 bg-emerald-50/50 py-3 rounded-r-xl">
            {post.excerpt}
          </div>

          {/* Rendered HTML Content */}
          <div
            className="prose prose-emerald lg:prose-lg max-w-none text-gray-800 leading-relaxed font-sans article-rich-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags Chips */}
          {post.tags && post.tags.length > 0 && (
            <div className="pt-6 border-t border-gray-100">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase mr-1">Tags:</span>
                {post.tags.map((t) => (
                  <Link
                    key={t.id}
                    href={`/blog?tag=${t.slug}`}
                    className="text-xs font-semibold px-3 py-1 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-800 text-gray-700 rounded-full transition"
                  >
                    #{t.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Social Share Strip */}
          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Share this article
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleShareTwitter}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold transition shadow-xs"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>X / Twitter</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? "Link Copied!" : "Copy Link"}</span>
              </button>
            </div>
          </div>
        </article>

        {/* Marketplace Banner CTA */}
        <div className="bg-gradient-to-r from-emerald-900 to-teal-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 shadow-md">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Carplug Verified Ecosystem</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black">
              Ready to Buy or Inspect a Verified Vehicle?
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
              Access over 1,500+ verified vehicles with 150-point inspection reports and safe escrow protection.
            </p>
          </div>

          <Link
            href="/buyer/search"
            className="px-6 py-3 bg-white hover:bg-gray-100 text-emerald-900 text-xs sm:text-sm font-bold rounded-2xl transition whitespace-nowrap shadow-sm text-center"
          >
            Explore Inventory
          </Link>
        </div>

        {/* Related Articles Section */}
        {related && related.length > 0 && (
          <section className="space-y-6 pt-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h3 className="text-xl font-bold text-gray-900">Related Articles</h3>
              <Link
                href="/blog"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 transition"
              >
                View all stories
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {related.map((rel) => (
                <article
                  key={rel.id}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col group"
                >
                  <Link
                    href={`/blog/${rel.slug}`}
                    className="relative w-full aspect-[16/10] overflow-hidden bg-gray-100 block"
                  >
                    <Image
                      src={rel.coverImage}
                      alt={rel.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 uppercase">
                        {rel.category?.name || "News"}
                      </span>
                      <h4 className="text-sm font-bold text-gray-900 mt-1 line-clamp-2 group-hover:text-emerald-700 transition">
                        <Link href={`/blog/${rel.slug}`}>{rel.title}</Link>
                      </h4>
                    </div>

                    <div className="text-[11px] text-gray-400 mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                      <span>{rel.readTime}</span>
                      <span>
                        {rel.publishedAt
                          ? new Date(rel.publishedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          : "Recently"}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />

      <style jsx global>{`
        .article-rich-content h2 {
          font-size: 1.75rem;
          font-weight: 800;
          color: #111827;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          line-height: 1.25;
        }
        .article-rich-content h3 {
          font-size: 1.35rem;
          font-weight: 700;
          color: #1f2937;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
          line-height: 1.3;
        }
        .article-rich-content p {
          margin-bottom: 1.25rem;
          color: #374151;
          font-size: 1.05rem;
          line-height: 1.75;
        }
        .article-rich-content ul {
          list-style-type: disc;
          padding-left: 1.75rem;
          margin-bottom: 1.25rem;
          font-size: 1.05rem;
        }
        .article-rich-content ol {
          list-style-type: decimal;
          padding-left: 1.75rem;
          margin-bottom: 1.25rem;
          font-size: 1.05rem;
        }
        .article-rich-content li {
          margin-bottom: 0.5rem;
        }
        .article-rich-content blockquote {
          border-left: 4px solid #059669;
          padding-left: 1.25rem;
          font-style: italic;
          color: #374151;
          background-color: #f0fdf4;
          padding-top: 0.75rem;
          padding-bottom: 0.75rem;
          margin: 1.75rem 0;
          border-radius: 0 0.75rem 0.75rem 0;
        }
        .article-rich-content img {
          max-width: 100%;
          border-radius: 1rem;
          margin: 2rem 0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .article-rich-content pre {
          background-color: #1f2937;
          color: #f9fafb;
          padding: 1.25rem;
          border-radius: 1rem;
          overflow-x: auto;
          margin: 1.5rem 0;
        }
        .article-rich-content a {
          color: #059669;
          text-decoration: underline;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
