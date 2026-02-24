"use client"
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { QuickSearchResult, QuickSearchResultSchema } from 'contracts';

function QuickSearchResults({
    query,
    results
  }:{
    query: string,
    results: QuickSearchResult | null
  }) {
    if (query.length === 0) {
      return (
        <div className="p-4 text-sm text-muted-foreground">
          Start typing to see results...
        </div>
      );
    }

    const data = results?.data ?? [];

    if (data.length > 0) {
      return (
        <div className="flex flex-col max-h-75 overflow-y-auto">
          { data.map((item) => (
            <div 
              key={ item.id } 
              className="p-3 border-b last:border-0 hover:bg-accent cursor-pointer text-sm"
            >
              { item.name }
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className="p-4 text-sm text-muted-foreground">
        No results found for &quot;{query}&quot;
      </div>
    );
}

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<QuickSearchResult | null>(null);

  useEffect(() => {
    if (!query.trim()) return;

    const delaySearch = setTimeout(async () => {
      const response = await fetch(`/api/quick-search?q=${ encodeURIComponent(query) }`)

      if (!response.ok) {
        throw new Error(`Error when fetching data: ${response}`)
      }

      const validation = QuickSearchResultSchema.safeParse(await response.json());
      console.log(encodeURIComponent(query));

      if (validation.success) {
        setResults(validation.data);
      }

      if (validation.error) {
        throw new Error('Invalid search response');
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [query]);

  return (
    <div className="relative w-full max-w-md">
      <Popover open={ query.length > 0 }>
        <PopoverTrigger asChild>
          <div className="relative flex items-center w-full">
            <Input
              type="text"
              placeholder="Search Atelier..."
              className="pr-12 pl-4 h-10 w-full"
              value={ query }
              onChange={ (e) => setQuery(e.target.value) }
            />
            <Button 
              size="sm" 
              variant="ghost" 
              className="absolute right-1 h-8 w-8 p-0 hover:bg-transparent"
              type="submit"
            >
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">Search</span>
            </Button>
          </div>
        </PopoverTrigger>

        <PopoverContent
          className="w-(--radix-popover-trigger-width) p-0" 
          align="start"
          onOpenAutoFocus={ (e) => e.preventDefault() }
        >
          <QuickSearchResults query={ query } results={ results } />
        </PopoverContent>
      </Popover>
    </div>
  );
}