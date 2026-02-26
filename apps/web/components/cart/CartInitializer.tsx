"use client";

import { useEffect } from "react";
import { useCart } from "@/stores/cart.store";
import { useUser } from "@auth0/nextjs-auth0/client";

export default function CartInitializer() {
  const { setAuth, fetchCart } = useCart();
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading) {
      setAuth(!!user);
      fetchCart();
    }
  }, [user, isLoading, setAuth, fetchCart]);

  return null;
}