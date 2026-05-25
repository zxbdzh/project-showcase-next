"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Props {
  categories: Category[];
  currentCategory?: string;
  currentQ?: string;
}

export function ProjectFilters({ categories, currentCategory, currentQ }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setFilter(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/projects?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* 分类筛选 */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={!currentCategory ? "default" : "outline"}
          className="cursor-pointer rounded-sm"
          onClick={() => setFilter("category", null)}
        >
          全部
        </Badge>
        {categories.map((cat) => (
          <Badge
            key={cat.id}
            variant={currentCategory === cat.slug ? "default" : "outline"}
            className="cursor-pointer rounded-sm"
            onClick={() => setFilter("category", cat.slug)}
          >
            {cat.name}
          </Badge>
        ))}
      </div>

      {/* 搜索 */}
      <div className="relative max-w-xs">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          placeholder="搜索项目..."
          className="rounded-sm pl-9 font-mono"
          defaultValue={currentQ}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setFilter("q", (e.target as HTMLInputElement).value || null);
            }
          }}
        />
      </div>
    </div>
  );
}
