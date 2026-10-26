type BrandLogoProps = {
  className?: string;
  size?: number;
  title?: string;
  /** "mark" = SVG wordmark only; "full" = mark + TRAVEL text beside (nav) */
  variant?: "mark" | "full";
};

/**
 * Vector brand mark — no circular raster badge.
 * Layout matches Miki & Miki TRAVEL (staggered Miki / & Miki / TRAVEL).
 */
export function BrandLogo({
  className = "brand-logo",
  size = 44,
  title = "Miki & Miki TRAVEL",
  variant = "mark",
}: BrandLogoProps) {
  const mark = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
      className={variant === "mark" ? className : "brand-logo-mark"}
    >
      <rect width="96" height="96" rx="20" fill="#fff" />
      {/* Top Miki */}
      <text
        x="10"
        y="40"
        fill="#121417"
        fontFamily="var(--font-syne), Syne, Arial Black, sans-serif"
        fontWeight="800"
        fontStyle="italic"
        fontSize="22"
        letterSpacing="-0.8"
      >
        Miki
      </text>
      <circle cx="48" cy="26" r="2.6" fill="#E31C23" />
      {/* & Miki */}
      <text
        x="10"
        y="64"
        fill="#E31C23"
        fontFamily="var(--font-syne), Syne, Arial Black, sans-serif"
        fontWeight="800"
        fontStyle="italic"
        fontSize="20"
      >
        &amp;
      </text>
      <text
        x="30"
        y="64"
        fill="#121417"
        fontFamily="var(--font-syne), Syne, Arial Black, sans-serif"
        fontWeight="800"
        fontStyle="italic"
        fontSize="22"
        letterSpacing="-0.8"
      >
        Miki
      </text>
      <circle cx="68" cy="50" r="2.6" fill="#E31C23" />
      <text
        x="30"
        y="82"
        fill="#121417"
        fontFamily="var(--font-manrope), Manrope, Arial, sans-serif"
        fontWeight="700"
        fontSize="9"
        letterSpacing="1.8"
      >
        TRAVEL
      </text>
    </svg>
  );

  if (variant === "full") {
    return (
      <span className={`brand-logo-full ${className}`.trim()}>
        {mark}
        <span className="brand-logo-word">
          Miki &amp; Miki <em>TRAVEL</em>
        </span>
      </span>
    );
  }

  return mark;
}
