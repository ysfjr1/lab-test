import { useEffect, useState } from "react";
import type { Category, Tag } from "@/types";
import { categoryService, tagService } from "@/api/services";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

interface ArticleFiltersProps {
  search: string;
  category: string;
  tag: string;
  sort: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onTagChange: (value: string) => void;
  onSortChange: (value: string) => void;
}

export default function ArticleFilters({
  search,
  category,
  tag,
  sort,
  onSearchChange,
  onCategoryChange,
  onTagChange,
  onSortChange,
}: ArticleFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    categoryService.getAll().then(setCategories);
    tagService.getAll().then(setTags);
  }, []);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <Input
          placeholder="Search articles..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-3 gap-3 sm:flex">
        <Select
          options={categories.map((c) => ({ value: c.slug, label: c.name }))}
          placeholder="All categories"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
        />
        <Select
          options={tags.map((t) => ({ value: t.slug, label: t.name }))}
          placeholder="All tags"
          value={tag}
          onChange={(e) => onTagChange(e.target.value)}
        />
        <Select
          options={[
            { value: "latest", label: "Latest" },
            { value: "views", label: "Most viewed" },
          ]}
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
        />
      </div>
    </div>
  );
}
