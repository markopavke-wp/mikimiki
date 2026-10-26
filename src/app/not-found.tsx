import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 pt-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="section-title mx-auto">Stranica nije pronađena</h1>
      <p className="mt-4 max-w-md text-ink/65">
        Proverite adresu ili se vratite na početnu.
      </p>
      <Link href="/" className="btn-primary mt-8">
        Na početnu
      </Link>
    </div>
  );
}
