"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  fetchAdminBlogPosts,
  fetchBlogCategories,
  fetchBlogTags,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  createBlogCategory,
  deleteBlogCategory,
  createBlogTag,
  deleteBlogTag,
  uploadVehicleImages,
  BlogPost,
  BlogCategory,
  BlogTag,
  BlogPostInput,
} from "@/services/api";
import { WysiwygEditor } from "@/components/admin/WysiwygEditor";
import {
  Newspaper,
  Plus,
  FolderPlus,
  Tag,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Star,
  Eye,
  CheckCircle2,
  Clock,
  Archive,
  X,
  Upload,
  Loader2,
  Sparkles,
} from "lucide-react";

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  // Modals state
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);

  // Article Form State
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formExcerpt, setFormExcerpt] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formCoverImage, setFormCoverImage] = useState("");
  const [formCoverImageAlt, setFormCoverImageAlt] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formSelectedTagIds, setFormSelectedTagIds] = useState<string[]>([]);
  const [formAuthorName, setFormAuthorName] = useState("Carplug Editorial");
  const [formAuthorRole, setFormAuthorRole] = useState("Senior Auto Editor");
  const [formStatus, setFormStatus] = useState<"draft" | "published" | "archived">("published");
  const [formFeatured, setFormFeatured] = useState(false);
  const [formMetaTitle, setFormMetaTitle] = useState("");
  const [formMetaDesc, setFormMetaDesc] = useState("");
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Category & Tag Creation inline state
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [isCatSubmitting, setIsCatSubmitting] = useState(false);
  const [isTagSubmitting, setIsTagSubmitting] = useState(false);

  // Load initial data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [postsRes, catsRes, tagsRes] = await Promise.all([
        fetchAdminBlogPosts({
          status: statusFilter === "all" ? undefined : statusFilter,
          categoryId: categoryFilter || undefined,
          search: search || undefined,
        }),
        fetchBlogCategories(),
        fetchBlogTags(),
      ]);
      setPosts(postsRes.data);
      setCategories(catsRes);
      setTags(tagsRes);
    } catch (err) {
      console.warn("Failed to load blog data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, categoryFilter, search]);

  // Open Composer for New Article
  const handleOpenNewComposer = () => {
    setEditingPost(null);
    setFormTitle("");
    setFormSlug("");
    setFormExcerpt("");
    setFormContent("");
    setFormCoverImage("");
    setFormCoverImageAlt("");
    setFormCategoryId(categories[0]?.id || "");
    setFormSelectedTagIds([]);
    setFormAuthorName("Carplug Editorial");
    setFormAuthorRole("Senior Auto Editor");
    setFormStatus("published");
    setFormFeatured(false);
    setFormMetaTitle("");
    setFormMetaDesc("");
    setFormError("");
    setIsComposerOpen(true);
  };

  // Open Composer for Editing
  const handleOpenEditComposer = (post: BlogPost) => {
    setEditingPost(post);
    setFormTitle(post.title);
    setFormSlug(post.slug);
    setFormExcerpt(post.excerpt);
    setFormContent(post.content);
    setFormCoverImage(post.coverImage);
    setFormCoverImageAlt(post.coverImageAlt || "");
    setFormCategoryId(post.categoryId);
    setFormSelectedTagIds(post.tags?.map((t) => t.id) || []);
    setFormAuthorName(post.authorName || "Carplug Editorial");
    setFormAuthorRole(post.authorRole || "Senior Auto Editor");
    setFormStatus(post.status);
    setFormFeatured(post.featured);
    setFormMetaTitle(post.metaTitle || "");
    setFormMetaDesc(post.metaDescription || "");
    setFormError("");
    setIsComposerOpen(true);
  };

  // Auto-slugify title
  const handleTitleChange = (val: string) => {
    setFormTitle(val);
    if (!editingPost) {
      const slug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setFormSlug(slug);
    }
  };

  // Handle Cover Image Upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingCover(true);
      const urls = await uploadVehicleImages([file], "carplug/blog");
      if (urls.length > 0) {
        setFormCoverImage(urls[0]);
      }
    } catch (err: unknown) {
      alert((err as Error)?.message || "Failed to upload image.");
    } finally {
      setIsUploadingCover(false);
    }
  };

  // Toggle Tag selection
  const handleToggleTag = (tagId: string) => {
    setFormSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  // Save Article
  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError("Article title is required.");
      return;
    }
    if (!formExcerpt.trim()) {
      setFormError("Short summary/excerpt is required.");
      return;
    }
    if (!formContent.trim()) {
      setFormError("Article body content cannot be empty.");
      return;
    }
    if (!formCoverImage.trim()) {
      setFormError("Please upload or provide a cover image.");
      return;
    }
    if (!formCategoryId) {
      setFormError("Please select a category.");
      return;
    }

    setIsSaving(true);
    setFormError("");

    const payload: BlogPostInput = {
      title: formTitle,
      slug: formSlug,
      excerpt: formExcerpt,
      content: formContent,
      coverImage: formCoverImage,
      coverImageAlt: formCoverImageAlt,
      categoryId: formCategoryId,
      tagIds: formSelectedTagIds,
      authorName: formAuthorName,
      authorRole: formAuthorRole,
      status: formStatus,
      featured: formFeatured,
      metaTitle: formMetaTitle,
      metaDescription: formMetaDesc,
    };

    try {
      if (editingPost) {
        await updateBlogPost(editingPost.id, payload);
      } else {
        await createBlogPost(payload);
      }
      setIsComposerOpen(false);
      await loadData();
    } catch (err: unknown) {
      setFormError((err as Error)?.message || "Failed to save article.");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Article
  const handleDeletePost = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) return;
    try {
      await deleteBlogPost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: unknown) {
      alert((err as Error)?.message || "Failed to delete article.");
    }
  };

  // Toggle Featured Status
  const handleToggleFeatured = async (post: BlogPost) => {
    const updatedFeatured = !post.featured;
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, featured: updatedFeatured } : p))
    );
    try {
      await updateBlogPost(post.id, {
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        coverImage: post.coverImage,
        categoryId: post.categoryId,
        featured: updatedFeatured,
        status: post.status,
      });
    } catch (err) {
      console.warn("Failed to toggle featured status:", err);
      loadData();
    }
  };

  // Category Management Handlers
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setIsCatSubmitting(true);
    try {
      const created = await createBlogCategory({
        name: newCatName.trim(),
        description: newCatDesc.trim(),
      });
      setCategories((prev) => [...prev, created]);
      setNewCatName("");
      setNewCatDesc("");
    } catch (err: unknown) {
      alert((err as Error)?.message || "Failed to create category");
    } finally {
      setIsCatSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? Active articles must be reassigned first.`)) return;
    try {
      await deleteBlogCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err: unknown) {
      alert((err as Error)?.message || "Failed to delete category");
    }
  };

  // Tag Management Handlers
  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    setIsTagSubmitting(true);
    try {
      const created = await createBlogTag({ name: newTagName.trim() });
      setTags((prev) => [...prev, created]);
      setNewTagName("");
    } catch (err: unknown) {
      alert((err as Error)?.message || "Failed to create tag");
    } finally {
      setIsTagSubmitting(false);
    }
  };

  const handleDeleteTag = async (id: string, name: string) => {
    if (!confirm(`Delete tag "${name}"?`)) return;
    try {
      await deleteBlogTag(id);
      setTags((prev) => prev.filter((t) => t.id !== id));
    } catch (err: unknown) {
      alert((err as Error)?.message || "Failed to delete tag");
    }
  };

  // Statistics
  const totalArticles = posts.length;
  const publishedCount = posts.filter((p) => p.status === "published").length;
  const draftCount = posts.filter((p) => p.status === "draft").length;
  const totalViews = posts.reduce((sum, p) => sum + (p.viewsCount || 0), 0);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              Editorial CMS
            </span>
            <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Live Database Connected
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
            Blog & Automotive Articles Manager
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">
            Publish automotive insights, car buying guides, electric vehicle advisories, and market trends directly to the Carplug public website.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs sm:text-sm font-semibold rounded-2xl transition shadow-xs"
          >
            <FolderPlus className="w-4 h-4 text-gray-600" />
            <span>Categories ({categories.length})</span>
          </button>

          <button
            onClick={() => setIsTagModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs sm:text-sm font-semibold rounded-2xl transition shadow-xs"
          >
            <Tag className="w-4 h-4 text-gray-600" />
            <span>Tags ({tags.length})</span>
          </button>

          <button
            onClick={handleOpenNewComposer}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold rounded-2xl transition shadow-sm hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>New Article</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase">
            <span>Total Articles</span>
            <Newspaper className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
            {totalArticles}
          </div>
          <p className="text-xs text-gray-500 mt-1">Across all categories</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold uppercase">
            <span>Published</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-2">
            {publishedCount}
          </div>
          <p className="text-xs text-gray-500 mt-1">Live on public frontend</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 text-xs font-semibold uppercase">
            <span>Drafts</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700 mt-2">
            {draftCount}
          </div>
          <p className="text-xs text-gray-500 mt-1">Pending editorial review</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-blue-700 text-xs font-semibold uppercase">
            <span>Total Reads / Views</span>
            <Eye className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-700 mt-2">
            {totalViews.toLocaleString()}
          </div>
          <p className="text-xs text-gray-500 mt-1">Reader engagements</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-full md:w-auto">
          {[
            { id: "all", label: "All" },
            { id: "published", label: "Published" },
            { id: "draft", label: "Drafts" },
            { id: "archived", label: "Archived" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === tab.id
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-emerald-600 focus:bg-white transition"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-48 py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-emerald-600 focus:bg-white text-gray-700"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
            <p className="text-xs font-medium">Loading articles from database...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
            <Newspaper className="w-12 h-12 text-gray-300 mb-3" />
            <h3 className="text-base font-bold text-gray-800">No articles found</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm">
              No posts match your current search or filter. Create your first article or reset the filter.
            </p>
            <button
              onClick={handleOpenNewComposer}
              className="mt-4 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition"
            >
              Compose Article
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  <th className="py-3.5 px-4">Article</th>
                  <th className="py-3.5 px-4">Category & Tags</th>
                  <th className="py-3.5 px-4">Author</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Telemetry</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50/70 transition group">
                    {/* Article Thumbnail + Title */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3.5 min-w-[260px] max-w-md">
                        <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                          {post.coverImage ? (
                            <Image
                              src={post.coverImage}
                              alt={post.title}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Newspaper className="w-5 h-5" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-gray-900 group-hover:text-emerald-700 transition truncate text-sm">
                              {post.title}
                            </span>
                            {post.featured && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                Featured
                              </span>
                            )}
                          </div>
                          <p className="text-gray-500 text-[11px] truncate mt-0.5">
                            {post.excerpt}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category & Tags */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold">
                          {post.category?.name || "Uncategorized"}
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {post.tags?.slice(0, 2).map((t) => (
                            <span
                              key={t.id}
                              className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded"
                            >
                              #{t.name}
                            </span>
                          ))}
                          {(post.tags?.length || 0) > 2 && (
                            <span className="text-[10px] text-gray-400">
                              +{(post.tags?.length || 0) - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Author */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{post.authorName}</div>
                      <div className="text-[11px] text-gray-400">{post.authorRole}</div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          post.status === "published"
                            ? "bg-emerald-100 text-emerald-800"
                            : post.status === "draft"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            post.status === "published"
                              ? "bg-emerald-600"
                              : post.status === "draft"
                              ? "bg-amber-600"
                              : "bg-gray-400"
                          }`}
                        />
                        {post.status.toUpperCase()}
                      </span>
                    </td>

                    {/* Telemetry (Reads, Read time, Date) */}
                    <td className="py-4 px-4 whitespace-nowrap text-gray-500 text-[11px]">
                      <div className="flex items-center gap-1.5 text-gray-700 font-semibold">
                        <Eye className="w-3.5 h-3.5 text-gray-400" />
                        <span>{(post.viewsCount || 0).toLocaleString()} views</span>
                      </div>
                      <div className="mt-0.5">{post.readTime}</div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(post)}
                          title={post.featured ? "Unmark featured" : "Feature on homepage"}
                          className={`p-1.5 rounded-lg border transition ${
                            post.featured
                              ? "bg-amber-50 text-amber-600 border-amber-200"
                              : "text-gray-400 hover:text-amber-500 border-transparent hover:border-gray-200"
                          }`}
                        >
                          <Star className={`w-4 h-4 ${post.featured ? "fill-amber-500" : ""}`} />
                        </button>

                        {post.status === "published" && (
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            title="View live post on frontend"
                            className="p-1.5 rounded-lg border border-transparent hover:border-gray-200 text-gray-500 hover:text-gray-900 transition"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenEditComposer(post)}
                          title="Edit article"
                          className="p-1.5 rounded-lg border border-transparent hover:border-gray-200 text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeletePost(post.id, post.title)}
                          title="Delete article"
                          className="p-1.5 rounded-lg border border-transparent hover:border-gray-200 text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* ARTICLE COMPOSER / WYSIWYG MODAL                                      */}
      {/* ===================================================================== */}
      {isComposerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-gray-100 flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
              <div className="flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-emerald-700" />
                <h2 className="text-lg font-bold text-gray-900">
                  {editingPost ? "Edit Article" : "Compose New Article"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsComposerOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveArticle} className="p-6 overflow-y-auto space-y-6 flex-1">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
                  {formError}
                </div>
              )}

              {/* Title & Slug */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Article Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Electric vs Gas Cars: Which One Should You Buy?"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    SEO Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="electric-vs-gas-cars"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-600 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Category & Tags Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  >
                    <option value="">Select Category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Publication Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) =>
                      setFormStatus(e.target.value as "draft" | "published" | "archived")
                    }
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  >
                    <option value="published">Published (Live)</option>
                    <option value="draft">Draft (Private)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Multi-Tag Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Tags & Topics
                </label>
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  {tags.map((t) => {
                    const isSelected = formSelectedTagIds.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleToggleTag(t.id)}
                        className={`text-xs px-3 py-1 rounded-full font-medium transition ${
                          isSelected
                            ? "bg-emerald-700 text-white shadow-xs"
                            : "bg-white text-gray-600 border border-gray-200 hover:border-emerald-600"
                        }`}
                      >
                        #{t.name}
                      </button>
                    );
                  })}
                  {tags.length === 0 && (
                    <span className="text-xs text-gray-400">No tags configured yet.</span>
                  )}
                </div>
              </div>

              {/* Cover Image Uploader */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Cover Image *
                </label>
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="relative w-full sm:w-48 h-32 rounded-xl border border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                    {formCoverImage ? (
                      <Image
                        src={formCoverImage}
                        alt="Cover preview"
                        fill
                        sizes="192px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-xs text-gray-400 font-medium">No Image</span>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl transition border border-emerald-200">
                        {isUploadingCover ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        <span>Upload Cover Image (Cloudinary)</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleCoverUpload}
                          disabled={isUploadingCover}
                        />
                      </label>
                    </div>

                    <input
                      type="url"
                      placeholder="Or paste direct image URL (https://...)"
                      value={formCoverImage}
                      onChange={(e) => setFormCoverImage(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none focus:border-emerald-600"
                    />

                    <input
                      type="text"
                      placeholder="Cover image accessibility alt text..."
                      value={formCoverImageAlt}
                      onChange={(e) => setFormCoverImageAlt(e.target.value)}
                      className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-500 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Article Summary / Excerpt *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formExcerpt}
                  onChange={(e) => setFormExcerpt(e.target.value)}
                  placeholder="Provide a compelling 2-3 sentence overview that appears on preview cards and Google search results..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              {/* WYSIWYG Editor */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Article Content (WYSIWYG Rich Editor) *
                </label>
                <WysiwygEditor
                  initialContent={formContent}
                  onChange={(html) => setFormContent(html)}
                  placeholder="Start writing the full body of the article. Use toolbar for headings, quotes, bullet points, and Cloudinary image insertion..."
                />
              </div>

              {/* Author & Featured */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Author Name
                  </label>
                  <input
                    type="text"
                    value={formAuthorName}
                    onChange={(e) => setFormAuthorName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Author Role / Title
                  </label>
                  <input
                    type="text"
                    value={formAuthorRole}
                    onChange={(e) => setFormAuthorRole(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800"
                  />
                </div>

                <div className="flex items-center sm:justify-center pt-5">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-800">
                    <input
                      type="checkbox"
                      checked={formFeatured}
                      onChange={(e) => setFormFeatured(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
                    />
                    <span>Feature on Homepage Banner</span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsComposerOpen(false)}
                  className="px-5 py-2.5 text-xs font-bold text-gray-600 hover:text-gray-900 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow-md disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingPost ? "Update Article" : "Publish Article"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* CATEGORY MANAGER MODAL                                                */}
      {/* ===================================================================== */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-gray-900">Manage Blog Categories</h3>
              </div>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Create category form */}
            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electric Vehicles"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Brief description for category..."
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                />
              </div>
              <button
                type="submit"
                disabled={isCatSubmitting}
                className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition"
              >
                {isCatSubmitting ? "Creating..." : "Add Category"}
              </button>
            </form>

            {/* Existing Categories List */}
            <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 border-t border-gray-100 pt-2">
              {categories.map((c) => (
                <div key={c.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-gray-900">{c.name}</div>
                    <div className="text-[11px] text-gray-400 font-mono">/blog?category={c.slug}</div>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(c.id, c.name)}
                    className="p-1 text-gray-400 hover:text-red-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAG MANAGER MODAL                                                     */}
      {/* ===================================================================== */}
      {isTagModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-gray-900">Manage Article Tags</h3>
              </div>
              <button
                onClick={() => setIsTagModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Create tag form */}
            <form onSubmit={handleCreateTag} className="flex gap-2">
              <input
                type="text"
                required
                placeholder="New tag name (e.g. Tokunbo)..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
              />
              <button
                type="submit"
                disabled={isTagSubmitting}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition"
              >
                {isTagSubmitting ? "Adding..." : "Add"}
              </button>
            </form>

            {/* Existing Tags Chips */}
            <div className="max-h-60 overflow-y-auto flex flex-wrap gap-2 border-t border-gray-100 pt-3">
              {tags.map((t) => (
                <span
                  key={t.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium"
                >
                  #{t.name}
                  <button
                    onClick={() => handleDeleteTag(t.id, t.name)}
                    className="hover:text-red-600 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
