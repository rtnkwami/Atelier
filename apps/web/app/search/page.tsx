import Catalog from "@/components/catalog/Catalog";
import SearchFilters from "@/components/catalog/SearchFilters";
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
        <h1 className="text-xl font-semibold italic text-muted-foreground">
          Results for: &quot;{params.name}&quot;
        </h1>
      </header>

      <div className="flex gap-6 px-6">
        <aside className="w-64 shrink-0">
          <SearchFilters categories={ categories }/>
        </aside>

        <main className="flex-1">
          <Catalog catalog={catalog} />
          {/* Pagination goes here */}
        </main>
      </div>
    </div>
  );

}