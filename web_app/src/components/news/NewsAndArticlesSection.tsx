"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { fetchBlogPosts, BlogPost } from "@/services/api";

export interface ArticleItem {
  id: string;
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  image: string;
  imageAlt: string;
}

const FALLBACK_FEATURED_ARTICLE: ArticleItem = {
  id: "featured-ev-vs-gas",
  slug: "electric-vs-gas-cars-which-one-should-you-buy",
  category: "Tips and Tricks",
  title: "Electric vs. Gas Cars: Which One Should You Buy?",
  excerpt:
    "With EVs becoming more popular, many buyers are torn between electric and gasoline-powered cars. This blog compares cost, maintenance, performance, and environmental impact to help you decide which one suits your lifestyle.",
  date: "Jan 23, 2025",
  readTime: "4 min read",
  image: "https://res.cloudinary.com/cgiq8vwf/image/upload/v1789679199/carplug/articles/news1.jpg",
  imageAlt: "Woman sitting in open trunk of white electric car while charging",
};

const FALLBACK_SIDE_ARTICLES: ArticleItem[] = [
  {
    id: "news-trade-in",
    slug: "trade-in-or-sell-whats-the-best-option-for-your-car",
    category: "News",
    title: "Trade-In or Sell? What's the Best Option for Your Car?",
    excerpt:
      "Thinking about upgrading your car? Learn the pros and cons of trading in vs. selling privately, how dealerships determine trade-in value, and which route earns you more money.",
    date: "Jan 20, 2025",
    readTime: "5 min read",
    image: "https://res.cloudinary.com/cgiq8vwf/image/upload/v1789679202/carplug/articles/news4.jpg",
    imageAlt: "Cars driving on multi-lane highway at sunset",
  },
  {
    id: "news-car-loan",
    slug: "5-tips-to-get-the-best-car-loan-deal",
    category: "News",
    title: "5 Tips to Get the Best Car Loan Deal",
    excerpt:
      "Financing a car can be overwhelming, but with the right strategy, you can secure the best loan terms. This article covers credit score impacts, pre-approval benefits, and negotiating tricks.",
    date: "Jan 15, 2025",
    readTime: "7 min read",
    image: "https://res.cloudinary.com/cgiq8vwf/image/upload/v1789679201/carplug/articles/news3.jpg",
    imageAlt: "White car parked on highway bridge overlooking sunset",
  },
  {
    id: "news-used-car-guide",
    slug: "the-ultimate-guide-to-buying-a-used-car",
    category: "News",
    title: "The Ultimate Guide to Buying a Used Car: What to Look For",
    excerpt:
      "Buying a used car can be a great investment, but knowing what to check before making a purchase is crucial. This guide covers key inspection points, vehicle history reports, and test drive must-dos.",
    date: "Jan 10, 2025",
    readTime: "6 min read",
    image: "https://res.cloudinary.com/cgiq8vwf/image/upload/v1789679200/carplug/articles/news2.jpg",
    imageAlt: "4x4 SUV parked in mountain desert landscape",
  },
];

function mapPostToArticleItem(post: BlogPost): ArticleItem {
  return {
    id: post.id,
    slug: post.slug,
    category: post.category?.name || "Editorial",
    title: post.title,
    excerpt: post.excerpt,
    date: post.publishedAt
      ? new Date(post.publishedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Recently",
    readTime: post.readTime || "5 min read",
    image: post.coverImage,
    imageAlt: post.coverImageAlt || post.title,
  };
}

interface NewsAndArticlesSectionProps {
  onSelectArticle?: (article: ArticleItem) => void;
}

export const NewsAndArticlesSection = ({
  onSelectArticle,
}: NewsAndArticlesSectionProps) => {
  const [featuredArticle, setFeaturedArticle] = useState<ArticleItem>(FALLBACK_FEATURED_ARTICLE);
  const [sideArticles, setSideArticles] = useState<ArticleItem[]>(FALLBACK_SIDE_ARTICLES);

  useEffect(() => {
    let isMounted = true;
    async function loadLatestArticles() {
      try {
        const res = await fetchBlogPosts({ limit: 4 });
        if (isMounted && res.data && res.data.length > 0) {
          const featuredPost = res.data.find((p) => p.featured) || res.data[0];
          setFeaturedArticle(mapPostToArticleItem(featuredPost));

          const otherPosts = res.data.filter((p) => p.id !== featuredPost.id).slice(0, 3);
          if (otherPosts.length > 0) {
            setSideArticles(otherPosts.map(mapPostToArticleItem));
          }
        }
      } catch (err) {
        console.warn("Failed to load blog posts dynamically:", err);
      }
    }
    loadLatestArticles();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 font-sans">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-gray-900 tracking-[-0.055em]">
          News and Articles
        </h2>

        <Link
          href="/blog"
          className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-emerald-700 transition tracking-tight group"
        >
          <span>View All</span>
          <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>

      {/* 2-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Large Featured Article */}
        <Link
          href={`/blog/${featuredArticle.slug}`}
          onClick={() => onSelectArticle?.(featuredArticle)}
          className="lg:col-span-6 flex flex-col group cursor-pointer"
        >
          {/* Main Image */}
          <div className="relative w-full aspect-[16/11] rounded-xl overflow-hidden bg-gray-100 mb-4 shadow-sm">
            <Image
              src={featuredArticle.image}
              alt={featuredArticle.imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          </div>

          {/* Article Info */}
          <div>
            <span className="text-xs font-semibold text-emerald-700 tracking-wide uppercase">
              {featuredArticle.category}
            </span>

            <h3 className="text-xl sm:text-2xl lg:text-[25px] font-medium text-gray-900 tracking-[-0.04em] mt-1.5 group-hover:text-emerald-800 transition leading-snug">
              {featuredArticle.title}
            </h3>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mt-2 line-clamp-3">
              {featuredArticle.excerpt}
            </p>

            <div className="text-xs text-gray-500 font-normal mt-3">
              {featuredArticle.date} • {featuredArticle.readTime}
            </div>
          </div>
        </Link>

        {/* Right Column: 3 Stacked Articles */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {sideArticles.map((article) => (
            <Link
              key={article.id}
              href={`/blog/${article.slug}`}
              onClick={() => onSelectArticle?.(article)}
              className="flex items-center gap-4 sm:gap-5 group cursor-pointer"
            >
              {/* Thumbnail Image */}
              <div className="relative w-28 sm:w-32 md:w-36 h-28 sm:h-32 md:h-36 aspect-square rounded-xl overflow-hidden bg-gray-100 shrink-0 shadow-sm">
                <Image
                  src={article.image}
                  alt={article.imageAlt}
                  fill
                  sizes="144px"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>

              {/* Text Content */}
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-emerald-700 tracking-wide uppercase">
                  {article.category}
                </span>

                <h3 className="text-sm sm:text-base font-medium text-gray-900 tracking-[-0.03em] mt-1 group-hover:text-emerald-800 transition leading-snug">
                  {article.title}
                </h3>

                <p className="text-xs text-gray-600 leading-relaxed mt-1.5 line-clamp-2">
                  {article.excerpt}
                </p>

                <div className="text-xs text-gray-500 font-normal mt-2">
                  {article.date} • {article.readTime}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
