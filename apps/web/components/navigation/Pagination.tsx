"use client"
import { usePathname, useSearchParams } from "next/navigation";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
}

export default function ResultsPagination({ currentPage, totalPages }: PaginationProps) {
  const path = usePathname();
  const searcParams = useSearchParams();

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searcParams.toString());

    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }
    return `${ path }?${ params.toString() }`;
  }

  if (totalPages <= 0) return;

  return (
    <Pagination>
      <PaginationContent>
         { currentPage > 1 && (
            <PaginationItem>
              <PaginationPrevious href={ createPageUrl(currentPage - 1) } />
            </PaginationItem>
        ) }

        <PaginationItem>
          <PaginationLink href={ createPageUrl(1) } isActive={ currentPage === 1 }>
            1
          </PaginationLink>
        </PaginationItem>

        { currentPage > 3 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        ) }

        { currentPage > 1 && currentPage < totalPages && (
          <PaginationItem>
            <PaginationLink href={ createPageUrl(currentPage) } isActive>
              { currentPage }
            </PaginationLink>
          </PaginationItem>
        ) }

        { currentPage < totalPages - 2 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        ) }

        { totalPages > 1 && (
          <PaginationItem>
            <PaginationLink 
              href={ createPageUrl(totalPages) } 
              isActive={ currentPage === totalPages }
            >
              { totalPages }
            </PaginationLink>
          </PaginationItem>
        ) }

        { currentPage < totalPages && (
          <PaginationItem>
            <PaginationNext href={ createPageUrl(currentPage + 1) } />
          </PaginationItem>
        ) }
      </PaginationContent>
    </Pagination>
  );
}