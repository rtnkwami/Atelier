import Image from 'next/image';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import type { PublicProduct } from 'contracts';

export default function ProductCard({ product }: { product: PublicProduct }) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-300 cursor-pointer overflow-hidden rounded-lg p-0">
      <div className="relative w-full aspect-4/3">
        {product.images?.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            unoptimized
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-sm">No image</span>
          </div>
        )}
      </div>

      <div className="p-3">
        <CardTitle className="text-base mb-1">{product.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground mb-1">
          {product.description ?? 'No description available.'}
        </CardDescription>
        <p className="text-lg font-medium">{product.price}</p>
      </div>
    </Card>
  );
}