"use server";

import { signOut as naSignOut } from "@/auth";

export async function signOutAction() {
  await naSignOut({ redirectTo: "/" });
}
