export default function Card({ children, title, className = '', neon = false }) {
  return (
    <div className={`${neon ? 'card-neon' : 'card'} ${className}`}>
      {title && (
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
