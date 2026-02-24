import {  SearchProductResponse } from "contracts";
import ProductCard from "./ProductCard";

export default function Catalog({ catalog }: { catalog: SearchProductResponse }) {
  if (catalog.totalItems === 0) {
    return (
      <p>No products to display</p>
    )
  }
  
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {catalog.products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}