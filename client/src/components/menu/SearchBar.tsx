import { Search } from 'lucide-react';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function SearchBar({ value, onChange }: Props) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Menüde ara..."
        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-brand-card border border-brand-border text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary/40 transition"
      />
    </div>
  );
}
