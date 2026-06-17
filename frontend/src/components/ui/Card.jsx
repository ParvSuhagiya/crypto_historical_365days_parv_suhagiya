import clsx from 'clsx';

export default function Card({ children, className, title, action, ...props }) {
  return (
    <div
      className={clsx(
        'rounded-xl border border-slate-200 bg-white p-6 shadow-sm',
        className
      )}
      {...props}
    >
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-4">
          {title && <h3 className="text-lg font-semibold text-slate-800">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
