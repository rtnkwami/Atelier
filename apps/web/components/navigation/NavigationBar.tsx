import Link from "next/link";
import SearchBar from "./SearchBar";
import { auth0 } from "@/lib/auth0";
import LoginButton from "@/components/auth/LoginButton";
import UserProfile from "@/components/auth/UserProfile";
import Cart from '@/components/cart/Cart';

export default async function NavigationBar() {
  const session = await auth0.getSession();
  const user = await session?.user;


  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center px-6 h-16 bg-background border-b border-border">
      {/* Left - Logo */}
      <div>
        <Link
          href="/"
          className="text-xl font-bold tracking-tight hover:opacity-90 transition-opacity"
        >
          Atelier
        </Link>
      </div>

      {/* Middle - Search */}
      <div className="flex-1 flex justify-center px-4">
        <div className="w-full max-w-md">
          <SearchBar />
        </div>
      </div>

      {/* Right - Avatar */}
      <div className="flex items-center gap-4 ml-auto pr-12">
        {user ? <UserProfile /> : <LoginButton />}
      </div>
      <Cart />
    </nav>
  );
}