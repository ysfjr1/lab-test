import { useEffect, useState, type FormEvent } from "react";
import type { Category } from "@/types";
import { categoryService } from "@/api/services";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { TableRowSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    categoryService
      .getAll()
      .then(setCategories)
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingId(cat._id);
    setName(cat.name);
    setDescription(cat.description ?? "");
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const updated = await categoryService.update(editingId, {
          name,
          description,
        });
        setCategories((prev) =>
          prev.map((c) => (c._id === editingId ? updated : c))
        );
      } else {
        const created = await categoryService.create({ name, description });
        setCategories((prev) => [...prev, created]);
      }
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this category?")) return;
    await categoryService.delete(id);
    setCategories((prev) => prev.filter((c) => c._id !== id));
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500">
            Organize your articles by category
          </p>
        </div>
        <Button onClick={openCreate}>
          <svg
            className="mr-1.5 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Add Category
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left">
                <th className="px-5 py-3 font-medium text-gray-500">Name</th>
                <th className="px-5 py-3 font-medium text-gray-500 hidden sm:table-cell">
                  Description
                </th>
                <th className="px-5 py-3 font-medium text-gray-500">
                  Articles
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRowSkeleton key={i} cols={4} />
                ))
              ) : categories.length > 0 ? (
                categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {cat.name}
                    </td>
                    <td className="px-5 py-3 text-gray-500 hidden sm:table-cell">
                      {cat.description || "—"}
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {cat.articleCount}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(cat)}
                          className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(cat._id)}
                          className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>
                    <EmptyState
                      title="No categories yet"
                      description="Create your first category."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Category" : "New Category"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
            required
          />
          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={saving}>
              {editingId ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
