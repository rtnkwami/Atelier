import { Button } from "@/components/ui/button";
import { getCatalogProduct } from "@/lib/data/inventory";
import Image from "next/image";

export default async function ProductPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const product = await getCatalogProduct(id);

  return (
    <>
      <aside className="fixed top-0 left-0 w-70 h-screen flex flex-col justify-center px-10 gap-4 z-10">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-widest text-muted-foreground italic">
            {product.category}
          </p>
          <h1 className="text-3xl font-bold tracking-tight">
            {product.name}
          </h1>
        </div>
        <p className="text-base text-muted-foreground leading-relaxed">
          {product.description}
        </p>
      </aside>

      <aside className="fixed top-0 right-0 w-70 h-screen flex flex-col justify-center px-10 gap-6 z-10">
        <p className="text-2xl font-medium">
          ${product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
        <Button size="lg" className="w-full py-6 text-base rounded-none">
          Add to Cart
        </Button>
      </aside>

      <main className="ml-70 mr-70 px-12 py-12 flex flex-col gap-8">
        {product.images?.map((url: string, index: number) => (
          <div key={index} className="relative aspect-4/5 w-full bg-secondary overflow-hidden rounded-sm">
            <Image
              src={url}
              alt={`${product.name} image ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
            />
          </div>
        ))}
      </main>
    </>
  );
}