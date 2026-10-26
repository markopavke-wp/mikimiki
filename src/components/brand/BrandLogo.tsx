import Image from "next/image";

type BrandLogoProps = {
  className?: string;
  size?: number;
  title?: string;
};

/** Crisp circular brand badge */
export function BrandLogo({
  className = "brand-logo",
  size = 44,
  title = "Miki & Miki TRAVEL",
}: BrandLogoProps) {
  return (
    <Image
      src="/images/logo-badge.png"
      alt={title}
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}
