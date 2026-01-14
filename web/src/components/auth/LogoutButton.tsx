"use client";

import { redirect } from "next/navigation";
import { Button } from "../ui/button";

export default function LogoutButton() {
  return (
    <Button
      onClick={() => redirect("auth/logout")}
      className="button logout cursor-pointer"
    >
      Log Out
    </Button>
  );
}