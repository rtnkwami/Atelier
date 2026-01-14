"use client";

import { redirect } from "next/navigation";
import { Button } from "../ui/button";

export default function LoginButton() {
  return (
    <Button
      onClick={() => redirect("auth/login")}
      className="button login cursor-pointer"
    >
      Log In
    </Button>
  );
}