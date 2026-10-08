"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  Code,
  Eye,
  Edit3,
  Loader2,
} from "lucide-react";
import { uploadVehicleImages } from "@/services/api";

interface WysiwygEditorProps {
  initialContent?: string;
  onChange: (htmlContent: string) => void;
  placeholder?: string;
}

export const WysiwygEditor: React.FC<WysiwygEditorProps> = ({
  initialContent = "",
  onChange,
  placeholder = "Write your engaging article content here...",
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [contentHtml, setContentHtml] = useState<string>(initialContent);
  const [wordCount, setWordCount] = useState(0);

  const updateCounts = (html: string) => {
    const text = html.replace(/<[^>]*>/g, " ").trim();
    const words = text ? text.split(/\s+/).length : 0;
    setWordCount(words);
  };

  // Sync initial content once mounted
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== initialContent) {
      editorRef.current.innerHTML = initialContent;
      setContentHtml(initialContent);
      updateCounts(initialContent);
    }
  }, [initialContent]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setContentHtml(html);
      updateCounts(html);
      onChange(html);
    }
  };

  const executeCommand = (command: string, value: string | undefined = undefined) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, value);
    handleInput();
  };

  const handleInsertLink = () => {
    const url = prompt("Enter hyperlink URL (e.g. https://example.com):");
    if (url) {
      executeCommand("createLink", url);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploadingImage(true);
      const urls = await uploadVehicleImages(Array.from(files), "carplug/blog");
      if (urls && urls.length > 0) {
        urls.forEach((url) => {
          executeCommand("insertImage", url);
        });
      }
    } catch (err: unknown) {
      alert((err as Error)?.message || "Failed to upload image. Please try again.");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const calcReadingTime = (words: number) => {
    const mins = Math.max(1, Math.ceil(words / 200));
    return `${mins} min read`;
  };

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-xs focus-within:border-emerald-600 transition">
      {/* Editor Navigation / View Toggle */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50/70 text-xs">
        <div className="flex items-center gap-1 bg-gray-200/70 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("edit")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition ${
              activeTab === "edit"
                ? "bg-white text-gray-900 shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editor</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition ${
              activeTab === "preview"
                ? "bg-white text-gray-900 shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Preview</span>
          </button>
        </div>

        <div className="text-gray-500 font-medium flex items-center gap-3">
          <span>{wordCount} words</span>
          <span>•</span>
          <span className="text-emerald-700 font-semibold">{calcReadingTime(wordCount)}</span>
        </div>
      </div>

      {/* Editor Toolbar (Only in Edit mode) */}
      {activeTab === "edit" && (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-100 bg-white">
          <button
            type="button"
            title="Bold"
            onClick={() => executeCommand("bold")}
            className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Italic"
            onClick={() => executeCommand("italic")}
            className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Underline"
            onClick={() => executeCommand("underline")}
            className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <Underline className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Strikethrough"
            onClick={() => executeCommand("strikeThrough")}
            className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-gray-200 mx-1" />

          <button
            type="button"
            title="Heading 2"
            onClick={() => executeCommand("formatBlock", "<h2>")}
            className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Heading 3"
            onClick={() => executeCommand("formatBlock", "<h3>")}
            className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <Heading3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Normal Paragraph"
            onClick={() => executeCommand("formatBlock", "<p>")}
            className="px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            P
          </button>

          <div className="w-px h-5 bg-gray-200 mx-1" />

          <button
            type="button"
            title="Bullet List"
            onClick={() => executeCommand("insertUnorderedList")}
            className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Numbered List"
            onClick={() => executeCommand("insertOrderedList")}
            className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Blockquote"
            onClick={() => executeCommand("formatBlock", "<blockquote>")}
            className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Code Block"
            onClick={() => executeCommand("formatBlock", "<pre>")}
            className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <Code className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-gray-200 mx-1" />

          <button
            type="button"
            title="Insert Link"
            onClick={handleInsertLink}
            className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <LinkIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            title="Upload and Embed Image"
            disabled={isUploadingImage}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition"
          >
            {isUploadingImage ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            ) : (
              <ImageIcon className="w-4 h-4" />
            )}
            <span>Insert Image</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />

          <div className="w-px h-5 bg-gray-200 mx-1" />

          <button
            type="button"
            title="Undo"
            onClick={() => executeCommand("undo")}
            className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Redo"
            onClick={() => executeCommand("redo")}
            className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Editor Content Area */}
      {activeTab === "edit" ? (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          data-placeholder={placeholder}
          className="min-h-[320px] max-h-[550px] overflow-y-auto p-5 text-gray-900 focus:outline-none article-content-editable leading-relaxed prose max-w-none text-base"
        />
      ) : (
        /* Live Preview Mode */
        <div className="min-h-[320px] max-h-[550px] overflow-y-auto p-6 bg-gray-50/50">
          {contentHtml ? (
            <div
              className="prose max-w-none text-gray-900 leading-relaxed font-sans"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          ) : (
            <p className="text-gray-400 italic text-sm">Nothing written yet to preview.</p>
          )}
        </div>
      )}

      <style jsx global>{`
        .article-content-editable:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          cursor: text;
          pointer-events: none;
        }
        .article-content-editable h2,
        .prose h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          line-height: 1.3;
        }
        .article-content-editable h3,
        .prose h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          line-height: 1.35;
        }
        .article-content-editable p,
        .prose p {
          margin-bottom: 1rem;
          color: #374151;
        }
        .article-content-editable ul,
        .prose ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .article-content-editable ol,
        .prose ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .article-content-editable blockquote,
        .prose blockquote {
          border-left: 4px solid #10b981;
          padding-left: 1rem;
          font-style: italic;
          color: #4b5563;
          margin: 1.25rem 0;
          background-color: #f9fafb;
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
          border-radius: 0 0.5rem 0.5rem 0;
        }
        .article-content-editable img,
        .prose img {
          max-width: 100%;
          border-radius: 0.75rem;
          margin: 1.5rem 0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .article-content-editable pre,
        .prose pre {
          background-color: #1f2937;
          color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.75rem;
          overflow-x: auto;
          font-family: monospace;
          margin: 1rem 0;
        }
      `}</style>
    </div>
  );
};
