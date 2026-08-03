import React from "react";

function sameOriginPartnerLogo(logoPath) {
  if (typeof logoPath !== "string" || !logoPath.startsWith("/partners/")) {
    return null;
  }

  try {
    const origin = window.location.origin;
    const url = new URL(logoPath, origin);
    return url.origin === origin && url.pathname.startsWith("/partners/")
      ? `${url.pathname}${url.search}`
      : null;
  } catch {
    return null;
  }
}

export default function PartnerBrand({ partner }) {
  const name = partner?.name?.trim();
  if (!name) return null;

  const partnerLogo = sameOriginPartnerLogo(partner.logoPath);

  return (
    <div className="flex flex-wrap items-center gap-3" aria-label={`Everwise with ${name}`}>
      <img
        src="/everwise-logo-192.png"
        alt=""
        aria-hidden="true"
        className="h-10 w-10 object-contain"
      />
      {partnerLogo ? (
        <img
          src={partnerLogo}
          alt={`${name} logo`}
          className="h-10 max-w-32 object-contain"
        />
      ) : null}
      <p className="font-sans text-2xl font-bold leading-tight tracking-tight text-ink sm:text-3xl">
        Everwise with {name}
      </p>
    </div>
  );
}
