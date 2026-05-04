import clsx from 'clsx';

export function FieldLabel({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-brand-muted">{label}</span>
      <div className="mt-1">{children}</div>
      {hint && <p className="text-[11px] text-brand-muted mt-1">{hint}</p>}
    </label>
  );
}

export const inputCls =
  'w-full px-3 py-2 rounded-xl bg-brand-background border border-brand-border text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/50 disabled:opacity-60';

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={clsx(
        'flex items-center justify-between w-full px-3 py-2 rounded-xl border text-sm transition',
        checked
          ? 'border-brand-primary/60 bg-brand-primary/10 text-brand-primary'
          : 'border-brand-border bg-brand-background text-brand-text',
      )}
    >
      <span>{label}</span>
      <span
        className={clsx(
          'inline-block h-5 w-9 rounded-full relative transition',
          checked ? 'bg-brand-primary' : 'bg-[var(--color-card-2)]',
        )}
      >
        <span
          className={clsx(
            'absolute top-0.5 h-4 w-4 rounded-full bg-black transition',
            checked ? 'right-0.5' : 'left-0.5',
          )}
        />
      </span>
    </button>
  );
}

export function PrimaryButton({
  children,
  type = 'button',
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  type?: 'button' | 'submit';
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="px-4 py-2 rounded-xl bg-brand-primary text-black font-semibold hover:opacity-90 disabled:opacity-60"
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  type = 'button',
  onClick,
  tone = 'default',
}: {
  children: React.ReactNode;
  type?: 'button' | 'submit';
  onClick?: () => void;
  tone?: 'default' | 'danger';
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={clsx(
        'px-4 py-2 rounded-xl border text-sm font-medium transition',
        tone === 'danger'
          ? 'border-red-500/40 text-red-400 hover:bg-red-500/10'
          : 'border-brand-border text-brand-text hover:border-brand-primary/60 hover:text-brand-primary',
      )}
    >
      {children}
    </button>
  );
}
