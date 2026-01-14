"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Button } from "../../ui/button";

export default function UserProfile() {
  const { user, isLoading } = useUser();

  if (isLoading || !user) {
    return (
      <Button asChild>
        <Link href="/auth/login">Log In</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full cursor-pointer">
          <Avatar>
            <AvatarImage src={user.picture} alt={user.name || "User"} />
            <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex flex-col items-center gap-2 p-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.picture} alt={user.name || "User"} />
            <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/dashboard">Dashboard</Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/settings">Settings</Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/auth/logout">Log Out</Link>
        </DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>
  );
}