import { useSiteSettings } from "@/context/site-settings";

export function SiteBrand({
  compact = false,
  light = false,
}: {
  compact?: boolean;
  light?: boolean;
}) {
  const { logoUrl } = useSiteSettings();
  if (logoUrl)
    return (
      <span
        className={`inline-flex items-center gap-2.5 ${light ? "text-primary-foreground" : "text-foreground"}`}
      >
        <img
          src={logoUrl}
          alt="DLFLY Overseas"
          width={44}
          height={44}
          className={
            compact
              ? "size-11 rounded-md bg-white object-contain p-1"
              : "size-11 rounded-full bg-white object-contain"
          }
        />
        {!compact && (
          <span className="leading-tight">
            <span className="block font-display text-lg font-extrabold">DLFLY</span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.16em] opacity-70">
              overseas
            </span>
          </span>
        )}
      </span>
    );
  return (
    <span
      className={`inline-flex items-center gap-2.5 ${light ? "text-primary-foreground" : "text-foreground"}`}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-md bg-primary font-display text-lg font-extrabold text-primary-foreground ring-1 ring-current/20">
        D
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block font-display text-lg font-extrabold">DLFLY</span>
          <span className="block text-[10px] font-bold uppercase tracking-[0.16em] opacity-70">
            overseas
          </span>
        </span>
      )}
    </span>
  );
}
