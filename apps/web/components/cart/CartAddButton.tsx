"use client";
import { Button } from "@/components/ui/button";
import { useCart } from "@/stores/cart.store";
import { PublicProduct } from "contracts";

export default function AddToCartButton({ product }: { product: PublicProduct }) {
  const addItem = useCart((state) => state.addItem);
  console.log(useCart().items);
  console.log(useCart().isAuthenticated);

  return (
    <Button
      size="lg"
      className="w-full py-6 text-base rounded-none cursor-pointer"
      onClick={() =>
        addItem({ ...product, image: product.images[0], quantity: 1 })
      }
    >
      Add to Cart
    </Button>
  );
}