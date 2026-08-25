"use client";

import React from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

export interface ArticleItem {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  image: string;
  imageAlt: string;
}

const FEATURED_ARTICLE: ArticleItem = {
  id: "featured-ev-vs-gas",
  category: "Tips and Tricks",
  title: "Electric vs. Gas Cars: Which One Should You Buy?",
  excerpt:
    "With EVs becoming more popular, many buyers are torn between electric and gasoline-powered cars. This blog compares cost, maintenance, performance, and environmental impact to help you decide which one suits your lifestyle.",
  date: "Jan 23, 2025",
  readTime: "4 min read",
  image: "/images/articles/news1.jpeg",
  imageAlt: "Woman sitting in open trunk of white electric car while charging",
};

const SIDE_ARTICLES: ArticleItem[] = [
  {
    id: "news-trade-in",
    category: "News",
    title: "Trade-In or Sell? What's the Best Option for Your Car?",
    excerpt:
      "Thinking about upgrading your car? Learn the pros and cons of trading in vs. selling privately, how dealerships determine trade-in value, and which route earns you more money.",
    date: "Jan 20, 2025",
    readTime: "5 min read",
    image: "/images/articles/news4.jpeg",
    imageAlt: "Cars driving on multi-lane highway at sunset",
  },
  {
    id: "news-car-loan",
    category: "News",
    title: "5 Tips to Get the Best Car Loan Deal",
    excerpt:
      "Financing a car can be overwhelming, but with the right strategy, you can secure the best loan terms. This article covers credit score impacts, pre-approval benefits, and negotiating tricks.",
    date: "Jan 15, 2025",
    readTime: "7 min read",
    image: "/images/articles/news3.jpeg",
    imageAlt: "White car parked on highway bridge overlooking sunset",
  },
  {
    id: "news-used-car-guide",
    category: "News",
    title: "The Ultimate Guide to Buying a Used Car: What to Look For",
    excerpt:
      "Buying a used car can be a great investment, but knowing what to check before making a purchase is crucial. This guide covers key inspection points, vehicle history reports, and test drive must-dos.",
    date: "Jan 10, 2025",
    readTime: "6 min read",
    image: "/images/articles/news2.jpeg",
    imageAlt: "4x4 SUV parked in mountain desert landscape",
  },
];

interface NewsAndArticlesSectionProps {
  onSelectArticle?: (article: ArticleItem) => void;
}

export const NewsAndArticlesSection = ({
  onSelectArticle,
}: NewsAndArticlesSectionProps) => {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-gray-900 tracking-[-0.055em]">
          News and Articles
        </h2>

        <button
          type="button"
          className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-black transition tracking-tight group"
        >
          <span>View All</span>
          <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      </div>

      {/* 2-Column Grid Layout with Reduced Padding / Gap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-7 items-start">
        {/* Left Column: Large Featured Article */}
        <div
          onClick={() => onSelectArticle?.(FEATURED_ARTICLE)}
          className="lg:col-span-6 flex flex-col group cursor-pointer"
        >
          {/* Main Image with Reduced Corner Radius (rounded-xl) */}
          <div className="relative w-full aspect-[16/11] rounded-xl overflow-hidden bg-gray-100 mb-4 shadow-sm">
            <Image
              src={FEATURED_ARTICLE.image}
              alt={FEATURED_ARTICLE.imageAlt}
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          </div>

          {/* Article Info */}
          <div>
            <span className="text-xs font-semibold text-emerald-700 tracking-wide uppercase">
              {FEATURED_ARTICLE.category}
            </span>

            {/* Title with Reduced Font Weight (font-medium) */}
            <h3 className="text-xl sm:text-2xl lg:text-[25px] font-medium text-gray-900 tracking-[-0.04em] mt-1.5 group-hover:text-black transition leading-snug">
              {FEATURED_ARTICLE.title}
            </h3>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mt-2 line-clamp-3">
              {FEATURED_ARTICLE.excerpt}
            </p>

            <div className="text-xs text-gray-500 font-normal mt-3">
              {FEATURED_ARTICLE.date} • {FEATURED_ARTICLE.readTime}
            </div>
          </div>
        </div>

        {/* Right Column: 3 Stacked Articles with Reduced Gap */}
        <div className="lg:col-span-6 flex flex-col gap-3.5 sm:gap-4">
          {SIDE_ARTICLES.map((article) => (
            <div
              key={article.id}
              onClick={() => onSelectArticle?.(article)}
              className="flex items-center gap-3.5 sm:gap-4 group cursor-pointer"
            >
              {/* Thumbnail Image: Perfect Square (equal width and height) + rounded-xl */}
              <div className="relative w-28 sm:w-32 md:w-36 h-28 sm:h-32 md:h-36 aspect-square rounded-xl overflow-hidden bg-gray-100 shrink-0 shadow-sm">
                <Image
                  src={article.image}
                  alt={article.imageAlt}
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>

              {/* Text Content */}
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-emerald-700 tracking-wide uppercase">
                  {article.category}
                </span>

                {/* Title with Reduced Font Weight (font-medium) */}
                <h3 className="text-sm sm:text-base font-medium text-gray-900 tracking-[-0.03em] mt-1 group-hover:text-black transition leading-snug">
                  {article.title}
                </h3>

                <p className="text-xs text-gray-600 leading-relaxed mt-1.5 line-clamp-2">
                  {article.excerpt}
                </p>

                <div className="text-xs text-gray-500 font-normal mt-2">
                  {article.date} • {article.readTime}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
