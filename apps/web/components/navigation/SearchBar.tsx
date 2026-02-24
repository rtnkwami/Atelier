"use client"
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react';

export default function SearchBar() {
  return (
    <div className="relative w-full max-w-md">
      <Popover open={false}>
        <PopoverTrigger asChild>
          <div className="relative flex items-center w-full">
            <Input
              type="text"
              placeholder="Search Atelier..."
              className="pr-12 pl-4 h-10 w-full"
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
        >
          <div className="p-4 text-sm text-muted-foreground">
            {/* Quick search results will be mapped here */}
            Start typing to see results...
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}