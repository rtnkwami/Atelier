import Catalog from "@/components/catalog/Catalog";
import { getCatalog } from "@/lib/data/inventory";

export default async function CatalogPage() {
  const catalog = await getCatalog();
    if (!catalog) {
      return (
        <p>There was an error displaying the Catalog</p>
      )
    }
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <Catalog catalog={ catalog }/>
    </div>
  );
}
