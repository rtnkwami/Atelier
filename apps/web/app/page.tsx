import Catalog from "@/components/catalog/Catalog";
import { getCatalog } from "@/lib/data";

export default async function CatalogPage() {
  const catalog = await getCatalog();
    if (!catalog) {
      return (
        <p>There was an error displaying the Catalog</p>
      )
    }
  return (
    <Catalog catalog={ catalog }/>
  );
}