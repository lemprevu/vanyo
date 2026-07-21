"use client";

import { UsersManager } from "@/app/admin/(panel)/utilisateurs/UsersManager";
import { useDemo } from "@/lib/demo/DemoProvider";
import { DEMO_CURRENT_USER_ID } from "@/lib/demo/seed";

export default function DemoUsersPage() {
  const { state, setEntity } = useDemo();
  return (
    <UsersManager
      initial={state.users}
      currentUserId={DEMO_CURRENT_USER_ID}
      live={false}
      onChange={(rows) => setEntity("users", rows)}
    />
  );
}
