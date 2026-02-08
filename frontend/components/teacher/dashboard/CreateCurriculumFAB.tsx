"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function CreateCurriculumFAB() {
  return (
    <Link href="/teacher/create">
      <Button
        variant="hero"
        className="fixed bottom-8 right-8 rounded-full w-16 h-16 shadow-2xl flex items-center justify-center text-2xl z-50"
      >
        +
      </Button>
    </Link>
  );
}
