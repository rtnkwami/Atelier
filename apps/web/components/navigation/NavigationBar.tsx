import Link from "next/link";

export default async function NavigationBar() {

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16 bg-background border-b border-border">
      <div className="flex items-center gap-2">
        <Link href="/" className="text-xl font-bold tracking-tight hover:opacity-90 transition-opacity">
          Atelier
        </Link>
      </div>

      {/* Search Bar Section */}
      <div className="flex-1 max-w-md mx-4">
        
      </div>

      {/* User Actions Section */}
      <div className="flex items-center gap-4">

      </div>
    </nav>
  );
}