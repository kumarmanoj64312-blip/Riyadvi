import { formatDateTime } from "@/lib/format";

/** Small shared table cells used across admin pages. */

export function PersonCell({ name, email, phone }: { name: string; email: string; phone?: string }) {
  return (
    <div className="min-w-0">
      <p className="font-medium text-fg">{name}</p>
      <a href={`mailto:${email}`} className="block truncate text-xs text-muted hover:text-gold">
        {email}
      </a>
      {phone && (
        <a href={`tel:${phone.replace(/\s/g, "")}`} className="block text-xs text-subtle hover:text-gold">
          {phone}
        </a>
      )}
    </div>
  );
}

export function DateCell({ iso }: { iso: string }) {
  return <time dateTime={iso} className="whitespace-nowrap text-xs text-muted">{formatDateTime(iso)}</time>;
}

export function Muted({ children }: { children: React.ReactNode }) {
  return <span className="text-muted">{children}</span>;
}
