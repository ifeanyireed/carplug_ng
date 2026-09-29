"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  fetchBlogPosts,
  fetchBlogCategories,
  fetchBlogTags,
  BlogPost,
  BlogCategory,
  BlogTag,
} from "@/services/api";
import {
  Search,
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  Loader2,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

export default function BlogIndexPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadInitialData() {
      setIsLoading(true);
      try {
        const [postsRes, catsRes, tagsRes] = await Promise.all([
          fetchBlogPosts({
            category: selectedCategory || undefined,
            tag: selectedTag || undefined,
            search: searchQuery || undefined,
            limit: 20,
          }),
          fetchBlogCategories(),
          fetchBlogTags(),
        ]);
        if (isMounted) {
          setPosts(postsRes.data);
          setCategories(catsRes);
          setTags(tagsRes);
        }
      } catch (err) {
        console.warn("Failed to load blog posts:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadInitialData();
    return () => {
      isMounted = false;
    };
  }, [selectedCategory, selectedTag, searchQuery]);

  // Featured Hero Article (first featured or most recent)
  const heroPost = posts.find((p) => p.featured) || posts[0];
  const gridPosts = heroPost ? posts.filter((p) => p.id !== heroPost.id) : posts;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        {/* Breadcrumb & Header */}
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
            <Link href="/" className="hover:text-emerald-700 transition">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-semibold text-gray-800">Blog & Editorial</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Carplug Insights & News</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">
                Automotive Journal & Buyer Guides
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-2 max-w-2xl leading-relaxed">
                Expert market valuations, inspection checklists, EV transitions, and essential car ownership tips for Nigeria.
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-emerald-600 shadow-xs transition"
              />
            </div>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("");
              setSelectedTag("");
            }}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition shadow-xs ${
              !selectedCategory && !selectedTag
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:border-gray-900"
            }`}
          >
            All Articles
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.slug);
                setSelectedTag("");
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition shadow-xs ${
                selectedCategory === cat.slug
                  ? "bg-emerald-700 text-white"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-emerald-700"
              }`}
            >
              {cat.name}
              {typeof cat.postCount === "number" && cat.postCount > 0 && (
                <span className="ml-1.5 opacity-70 text-[10px]">({cat.postCount})</span>
              )}
            </button>
          ))}
        </div>

        {/* Content Loading State */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
            <p className="text-sm font-medium">Fetching verified articles from database...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-gray-200 p-8">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900">No articles found</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-md mx-auto">
              We couldn&apos;t find any articles matching your search or filter. Try choosing another category or keyword.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("");
                setSelectedTag("");
                setSearchQuery("");
              }}
              className="mt-4 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Featured Hero Article */}
            {heroPost && !searchQuery && !selectedTag && (
              <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition group">
                <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                  <div className="relative lg:col-span-7 aspect-[16/10] lg:aspect-auto min-h-[300px] overflow-hidden bg-gray-100">
                    <Image
                      src={heroPost.coverImage}
                      alt={heroPost.coverImageAlt || heroPost.title}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-emerald-700 text-white text-[11px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Featured Editorial
                      </span>
                    </div>
                  </div>

                  <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                        {heroPost.category?.name || "Automotive Insights"}
                      </span>

                      <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-2 leading-snug group-hover:text-emerald-800 transition">
                        <Link href={`/blog/${heroPost.slug}`}>{heroPost.title}</Link>
                      </h2>

                      <p className="text-xs sm:text-sm text-gray-600 mt-3 leading-relaxed line-clamp-3 sm:line-clamp-4">
                        {heroPost.excerpt}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-gray-100 mt-6 flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        <span className="font-semibold text-gray-800">{heroPost.authorName}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span>{heroPost.readTime}</span>
                          <span>•</span>
                          <span>
                            {heroPost.publishedAt
                              ? new Date(heroPost.publishedAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "Recently"}
                          </span>
                        </div>
                      </div>

                      <Link
                        href={`/blog/${heroPost.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 transition group-hover:translate-x-1"
                      >
                        <span>Read Story</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Articles Grid (3 columns) */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <h3 className="text-lg font-bold text-gray-900">
                  {selectedCategory
                    ? `${categories.find((c) => c.slug === selectedCategory)?.name || "Category"} Articles`
                    : "Latest Stories & Practical Guides"}
                </h3>
                <span className="text-xs text-gray-500 font-medium">
                  {gridPosts.length} {gridPosts.length === 1 ? "article" : "articles"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {gridPosts.map((post) => (
                  <article
                    key={post.id}
                    className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col group"
                  >
                    {/* Thumbnail */}
                    <Link
                      href={`/blog/${post.slug}`}
                      className="relative w-full aspect-[16/10] overflow-hidden bg-gray-100 block"
                    >
                      <Image
                        src={post.coverImage}
                        alt={post.coverImageAlt || post.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs text-emerald-800 text-[10px] font-bold uppercase tracking-wider shadow-xs">
                          {post.category?.name || "General"}
                        </span>
                      </div>
                    </Link>

                    {/* Card Content */}
                    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition leading-snug line-clamp-2">
                          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                        </h4>
                        <p className="text-xs text-gray-500 mt-2 line-clamp-3 leading-relaxed">
                          {post.excerpt}
                        </p>
                      </div>

                      {/* Card Footer */}
                      <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between text-[11px] text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>{post.readTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>
                            {post.publishedAt
                              ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })
                              : "Recently"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Popular Topics Cloud */}
            {tags.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-800 mb-3">
                  Explore Topics by Tag
                </h4>
                <div className="flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setSelectedTag(selectedTag === t.slug ? "" : t.slug);
                        setSelectedCategory("");
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                        selectedTag === t.slug
                          ? "bg-emerald-700 text-white shadow-xs"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      #{t.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
