"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UserProfile() {
  const { user, isLoading } = useUser();

  if (isLoading || !user) return null;

  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() ?? "?";

  return (
    <DropdownMenu modal={ false }>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer hover:ring-2 hover:ring-border transition-all">
          <AvatarImage src={user.picture ?? ""} alt={user.name ?? "User"} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="center" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-3 py-2">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={user.picture ?? ""} alt={user.name ?? "User"} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="font-medium text-sm truncate">{user.name}</span>
            <span className="text-xs text-muted-foreground font-normal truncate">{user.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/auth/logout" className="cursor-pointer w-full">
            Log out
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}