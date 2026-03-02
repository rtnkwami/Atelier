"use client";

import { useEffect } from "react";
import { useCart } from "@/stores/cart.store";
import { useUser } from "@auth0/nextjs-auth0/client";

export default function CartInitializer() {
  const { setAuth, fetchCart } = useCart();
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (isLoading) return;

    const handleSync = async () => {
      setAuth(!!user);

      if (user) {
        const localData = localStorage.getItem("cart");
        
        let guestItems = [];
        if (localData) {
          try {
            const parsed = JSON.parse(localData);
            guestItems = Array.isArray(parsed) ? parsed : (parsed?.items || []);
          } catch (e) {
            console.error("Failed to parse local cart", e);
          }
        }

        if (guestItems.length > 0) {
          const res = await fetch("/api/cart", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: guestItems }),
          });

          if (res.ok) {
            localStorage.removeItem("cart");
          }
        }
      }
      
      await fetchCart();
    };

    handleSync();
  }, [user, isLoading, setAuth, fetchCart]);

  return null;
}