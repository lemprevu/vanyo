"use client";

import { SignatureBuilder } from "@/app/admin/(panel)/signature/SignatureBuilder";
import { useDemo } from "@/lib/demo/DemoProvider";

export default function DemoSignaturePage() {
  const { state } = useDemo();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Signature email</h1>
        <p className="mt-1 text-sm text-white/50">
          Générez une signature professionnelle à installer une fois dans votre boîte mail.
        </p>
      </div>
      <SignatureBuilder settings={state.settings} />
    </div>
  );
}
