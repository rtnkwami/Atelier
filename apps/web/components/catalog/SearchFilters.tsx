"use client"
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem
} from '@/components/ui/select';

export default function SearchFilters ({ categories }: { categories: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    category: searchParams.get("category") ?? undefined,
    minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
    maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
  });

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (filters.category) {
      params.set("category", filters.category);
    } else {
      params.delete("category");
    }

    if (filters.minPrice !== undefined) {
      params.set("minPrice", filters.minPrice.toString());
    } else {
      params.delete("minPrice");
    }

    if (filters.maxPrice !== undefined) {
      params.set("maxPrice", filters.maxPrice.toString());
    } else {
      params.delete("maxPrice");
    }

    router.push(`/search?${ params.toString() }`);
  }

  return (
    <div className="flex flex-col gap-6 p-4 border rounded-lg bg-card">
      <div>
        <label className="text-sm font-medium mb-2 block">Category</label>
        <Select
          value={filters.category ?? "all"}
          onValueChange={(val) => 
            setFilters((prev) => ({ ...prev, category: val === "all" ? undefined : val }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Price Range</label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minPrice ?? ""}
            onChange={(e) => 
              setFilters((prev) => ({ 
                ...prev, 
                minPrice: e.target.value ? Number(e.target.value) : undefined 
              }))
            }
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxPrice ?? ""}
            onChange={(e) => 
              setFilters((prev) => ({ 
                ...prev, 
                maxPrice: e.target.value ? Number(e.target.value) : undefined 
              }))
            }
          />
        </div>
      </div>

      <Button onClick={applyFilters} className="w-full">
        Apply Filters
      </Button>
    </div>
  );
}