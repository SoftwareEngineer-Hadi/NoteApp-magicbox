export function LoadingSkeleton({ label, rows = 3 }: { label: string; rows?: number }) {
  return (
    <div className="skeleton-list" aria-busy="true">
      <p className="sr-only" role="status">
        {label}
      </p>
      {Array.from({ length: rows }, (_, index) => (
        <div className="skeleton" key={index} />
      ))}
    </div>
  )
}
