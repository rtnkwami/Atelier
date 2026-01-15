import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from "@/lib/api/types/products";
import Image from "next/image";

type ProductCardProps = { product: Product }

export default function ProductCard({ product }: ProductCardProps) {
    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow pt-0">
        <div className="relative w-full h-48 bg-gray-200">
            <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
            />
        </div>

        <CardHeader>
            <CardTitle>{product.name}</CardTitle>
            <CardDescription className="capitalize">{product.category}</CardDescription>
        </CardHeader>
        
        <CardContent>
            {product.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                    {product.description}
                </p>
            )}
        </CardContent>
        
        <CardFooter>
            <span className="text-lg font-bold text-gray-900">
                ${product.price}
            </span>
        </CardFooter>
        </Card>
  );
}