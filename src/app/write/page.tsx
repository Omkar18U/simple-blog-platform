"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { ImagePlus, X, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";

// Dynamically import ReactQuill (no SSR)
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

// ─── Quill Toolbar Configuration ────────────────────────

const modules = {
  toolbar: [
    ["bold", "italic", "underline"],
    [{ header: [1, 2, 3, false] }],
    ["blockquote", "code-block"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image"],
    ["clean"],
  ],
};

const formats = [
  "bold",
  "italic",
  "underline",
  "header",
  "blockquote",
  "code-block",
  "list",
  "link",
  "image",
];

// ─── Page Component ─────────────────────────────────────

function WritePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("edit");
  const isEditing = !!editSlug;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editPostId, setEditPostId] = useState<string | null>(null);
  const [loadingPost, setLoadingPost] = useState(isEditing);

  // Load post for editing
  useEffect(() => {
    if (!editSlug) return;

    async function loadPost() {
      try {
        const res = await fetch(`/api/posts/${editSlug}`);
        if (res.ok) {
          const { post } = await res.json();
          setEditPostId(post.id);
          setTitle(post.title);
          setContent(post.content);
          setCoverImage(post.coverImage || "");
          setTags(post.tags?.map((t: { tag: { name: string } }) => t.tag.name) ?? []);
        } else {
          alert("Post not found or you don't have permission to edit it.");
          router.push("/");
        }
      } catch {
        alert("Failed to load post.");
        router.push("/");
      } finally {
        setLoadingPost(false);
      }
    }

    loadPost();
  }, [editSlug, router]);

  // Handle tag addition
  const addTag = useCallback(() => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
      setTags((prev) => [...prev, trimmed]);
      setTagInput("");
    }
  }, [tagInput, tags]);

  const removeTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  // Submit post
  const handleSubmit = async (status: "DRAFT" | "PUBLISHED") => {
    if (!title.trim()) return alert("Please enter a title");
    if (!content.trim()) return alert("Please add some content");

    const setter = status === "PUBLISHED" ? setPublishing : setSaving;
    setter(true);

    try {
      const url = isEditing && editPostId
        ? `/api/posts/${editPostId}`
        : "/api/posts";
      const method = isEditing && editPostId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          coverImage: coverImage || undefined,
          tags,
          status,
        }),
      });

      if (res.ok) {
        const { post } = await res.json();
        router.push(`/post/${post.slug}`);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save post");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setter(false);
    }
  };

  if (loadingPost) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-semibold text-foreground">
          {isEditing ? "Edit Post" : "Write Post"}
        </h1>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSubmit("DRAFT")}
            loading={saving}
          >
            Save Draft
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleSubmit("PUBLISHED")}
            loading={publishing}
          >
            Publish
          </Button>
        </div>
      </div>

      {/* Title input */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Your story title..."
        className="w-full text-3xl sm:text-4xl font-bold text-foreground placeholder:text-muted/40 border-none outline-none bg-transparent mb-6"
      />

      {/* Cover image upload area */}
      <div className="mb-6">
        {coverImage ? (
          <div className="relative rounded-xl overflow-hidden h-48 bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => setCoverImage("")}
              className="absolute top-3 right-3 p-1.5 bg-white/80 hover:bg-white rounded-full transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/40 transition-colors">
            <ImagePlus className="h-10 w-10 mx-auto text-muted/40 mb-2" />
            <p className="text-sm text-muted">Upload cover image</p>
            <input
              type="text"
              placeholder="Or paste an image URL..."
              className="mt-3 w-full max-w-sm mx-auto text-sm text-center border border-border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              onBlur={(e) => {
                if (e.target.value.trim()) setCoverImage(e.target.value.trim());
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const val = (e.target as HTMLInputElement).value.trim();
                  if (val) setCoverImage(val);
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-primary/10 text-primary rounded-full"
            >
              {tag}
              <button onClick={() => removeTag(tag)}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Add a tag and press Enter..."
            className="text-sm border-none outline-none bg-transparent placeholder:text-muted/40 min-w-37.5"
          />
        </div>
      </div>

      {/* Rich Text Editor */}
      <div className="rounded-xl overflow-hidden">
        <ReactQuill
          theme="snow"
          value={content}
          onChange={setContent}
          modules={modules}
          formats={formats}
          placeholder="Start writing your story..."
        />
      </div>
    </div>
  );
}

export default function WritePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <WritePageContent />
    </Suspense>
  );
}
