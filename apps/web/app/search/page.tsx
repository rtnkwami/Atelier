import Catalog from "@/components/catalog/Catalog";
import SearchFilters from "@/components/catalog/SearchFilters";
import ResultsPagination from "@/components/navigation/Pagination";
import { getCatalog, getCategories } from "@/lib/data/inventory";
import { SearchProducts } from "contracts";

export default async function SearchPage({
    searchParams
  }:{
    searchParams: Promise<SearchProducts>
  }) {
  const params = await searchParams;

  const catalog = await getCatalog(params);
  const categories = (await getCategories()).categories;

  if (!catalog) {
    return <p className="p-8 text-center">Error loading results.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="px-6 pt-6">
        <h1 className="text-xl font-semibold text-muted-foreground">
          {catalog.totalItems > 0 ? (
            <>
              Showing 
              <span className="text-muted-foreground mx-1">
                {Math.min((catalog.page - 1) * 20 + 1, catalog.totalItems)}–
                {Math.min(catalog.page * 20, catalog.totalItems)}
              </span> 
              of 
              <span className="text-muted-foreground mx-1">{catalog.totalItems}</span> 
              {params.name ? (
                <>results for <span className="italic">&quot;{params.name}&quot;</span></>
              ) : (
                "products"
              )}
            </>
          ) : (
            <>No results found {params.name && `for "${params.name}"`}</>
          )}
        </h1>
      </header>

      <div className="flex gap-6 px-6">
        <aside className="w-64 shrink-0">
          <div className="sticky top-20">
            <SearchFilters categories={categories} />
          </div>
        </aside>

        <main className="flex-1 flex flex-col min-h-[calc(100vh-200px)] relative">
          <div className="flex-1">
            <Catalog catalog={catalog} />
          </div>

          <div className="sticky bottom-0 mt-8 py-4 bg-white/80 backdrop-blur-md border-t flex justify-center">
            <ResultsPagination 
              currentPage={catalog.page} 
              totalPages={catalog.totalPages} 
            />
          </div>
        </main>
      </div>
    </div>
  );

}