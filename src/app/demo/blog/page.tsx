"use client";

import { ArticlesManager } from "@/app/admin/(panel)/blog/ArticlesManager";
import { useDemo } from "@/lib/demo/DemoProvider";

export default function DemoBlogPage() {
  const { state, setEntity } = useDemo();
  return (
    <ArticlesManager
      initial={state.articles}
      live={false}
      onChange={(rows) => setEntity("articles", rows)}
    />
  );
}
