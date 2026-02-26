import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ShoppingCart } from "lucide-react"

export default function Cart() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-10 w-10 cursor-pointer">
          <ShoppingCart className="h-5 w-5" />
          <span className="sr-only">Open shopping cart</span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
          <SheetDescription>
            Review your items before checking out.
          </SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          <div className="flex flex-col items-center justify-center h-full py-10">
            <p className="text-muted-foreground text-sm">Your cart is empty</p>
          </div>
        </div>
        <SheetFooter>
          <Button type="submit" className="w-full cursor-pointer">Proceed to Checkout</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
