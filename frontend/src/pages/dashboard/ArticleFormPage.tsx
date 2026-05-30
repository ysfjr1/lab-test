import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import type { ArticleFormData, Category, Tag } from "@/types";
import { articleService, categoryService, tagService } from "@/api/services";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Alert from "@/components/ui/Alert";
import { getApiErrorMessage } from "@/utils/apiError";

const quillModules = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "code-block"],
    ["link", "image"],
    ["clean"],
  ],
};

export default function ArticleFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = Boolean(id);

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<ArticleFormData>({
    title: "",
    excerpt: "",
    content: "",
    coverImage: "",
    category: "",
    tags: [],
    status: "draft",
  });

  useEffect(() => {
    categoryService.getAll().then(setCategories);
    tagService.getAll().then(setTags);
  }, []);

  useEffect(() => {
    if (!id || !user) return;
    setLoading(true);

    articleService.getById(id).then((article) => {
      if (
        !article ||
        (user.role === "author" && article.author._id !== user._id)
      ) {
        navigate("/dashboard/articles", { replace: true });
        setLoading(false);
        return;
      }
      setForm({
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        coverImage: article.coverImage,
        category: article.category._id,
        tags: article.tags.map((t) => t._id),
        status: article.status,
      });
      setLoading(false);
    });
  }, [id, user, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (isEditing) {
        await articleService.update(id!, form);
      } else {
        await articleService.create(form);
      }
      navigate("/dashboard/articles");
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Failed to save article. Please try again.")
      );
    } finally {
      setSaving(false);
    }
  };

  const handleTagToggle = (tagId: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter((t) => t !== tagId)
        : [...prev.tags, tagId],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? "Edit Article" : "New Article"}
        </h1>
        <p className="text-sm text-gray-500">
          {isEditing
            ? "Update your article details"
            : "Fill in the details below to create a new article"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <Alert>{error}</Alert>}

        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-5">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Enter article title"
            required
          />

          <Input
            label="Excerpt"
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            placeholder="A short summary of the article"
            required
          />

          <Input
            label="Cover Image URL"
            value={form.coverImage}
            onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
            placeholder="https://example.com/image.jpg"
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <Select
              label="Category"
              options={categories.map((c) => ({ value: c._id, label: c.name }))}
              placeholder="Select category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            />

            <Select
              label="Status"
              options={[
                { value: "draft", label: "Draft" },
                { value: "pending", label: "Pending Review" },
                { value: "published", label: "Published" },
              ]}
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value as ArticleFormData["status"],
                })
              }
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag._id}
                  type="button"
                  onClick={() => handleTagToggle(tag._id)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    form.tags.includes(tag._id)
                      ? "border-primary-300 bg-primary-50 text-primary-700"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Content
          </label>
          <ReactQuill
            theme="snow"
            value={form.content}
            onChange={(value) => setForm({ ...form, content: value })}
            modules={quillModules}
            className="[&_.ql-container]:min-h-[300px] [&_.ql-container]:rounded-b-lg [&_.ql-toolbar]:rounded-t-lg [&_.ql-toolbar]:border-gray-300 [&_.ql-container]:border-gray-300"
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/dashboard/articles")}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={saving}>
            {isEditing ? "Update Article" : "Create Article"}
          </Button>
        </div>
      </form>
    </div>
  );
}
