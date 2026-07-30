// A single shimmering placeholder block. Compose these to mirror a page's
// layout so navigation shows an instant skeleton while server data streams in.
export function Skel({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return <div className={`lg-skeleton ${className}`} style={style} />;
}
