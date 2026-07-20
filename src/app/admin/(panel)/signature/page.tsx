import { getSiteSettings } from "@/lib/data";
import { SignatureBuilder } from "./SignatureBuilder";

export const dynamic = "force-dynamic";

export default async function Page() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Signature email</h1>
        <p className="mt-1 text-sm text-white/50">
          Génère une signature avec le logo Vanyo, à installer une fois dans ta boîte mail.
        </p>
      </div>
      <SignatureBuilder settings={settings} />
    </div>
  );
}
