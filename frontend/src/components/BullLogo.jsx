export default function BullLogo({ className = "w-12 h-12", size, ...props }) {
  const dimensionStyle = size ? { width: size, height: size } : {};

  return (
    <div
      className={`relative overflow-hidden rounded-full flex items-center justify-center shrink-0 ${className}`}
      style={dimensionStyle}
    >
      <img
        src="/BullLogo.jpg"
        alt="Logo KANDAS"
        className="w-full h-full object-cover scale-[1.45]"
        {...props}
      />
    </div>
  );
}