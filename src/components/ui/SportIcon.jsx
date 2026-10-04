import { sportIconSrc } from '../../utils/sportIcons';

export default function SportIcon({
  name = '',
  all = false,
  alt = '',
  className = '',
  size = 22,
}) {
  const src = sportIconSrc(name, { all });
  const label = alt || (all ? 'All sports' : name) || 'Sport';
  return (
    <span
      role="img"
      aria-label={label}
      className={`sport-icon ${className}`.trim()}
      style={{
        width: size,
        height: size,
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
      }}
    />
  );
}
