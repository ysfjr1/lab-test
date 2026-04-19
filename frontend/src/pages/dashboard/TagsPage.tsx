import { useEffect, useState, type FormEvent } from "react";
import type { Tag } from "@/types";
import { tagService } from "@/api/services";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { TableRowSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    tagService
      .getAll()
      .then(setTags)
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setName("");
    setModalOpen(true);
  };

  const openEdit = (tag: Tag) => {
    setEditingId(tag._id);
    setName(tag.name);
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const updated = await tagService.update(editingId, { name });
        setTags((prev) => prev.map((t) => (t._id === editingId ? updated : t)));
      } else {
        const created = await tagService.create({ name });
        setTags((prev) => [...prev, created]);
      }
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this tag?")) return;
    await tagService.delete(id);
    setTags((prev) => prev.filter((t) => t._id !== id));
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tags</h1>
          <p className="text-sm text-gray-500">Manage article tags</p>
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
          Add Tag
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left">
                <th className="px-5 py-3 font-medium text-gray-500">Name</th>
                <th className="px-5 py-3 font-medium text-gray-500">Slug</th>
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
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRowSkeleton key={i} cols={4} />
                ))
              ) : tags.length > 0 ? (
                tags.map((tag) => (
                  <tr key={tag._id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {tag.name}
                    </td>
                    <td className="px-5 py-3 text-gray-500">{tag.slug}</td>
                    <td className="px-5 py-3 text-gray-500">
                      {tag.articleCount}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(tag)}
                          className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(tag._id)}
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
                      title="No tags yet"
                      description="Create your first tag."
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
        title={editingId ? "Edit Tag" : "New Tag"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tag name"
            required
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
