const ArrowIcon = ({ color, size = 30, className }: { color?: string; size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 29.77 29.77"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <g>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        fill={color}
        d="M26.633,15.988c-1.171,1.172-3.071,1.172-4.243,0l-4.505-4.505V26.77c0,1.658-1.343,3-3,3s-3-1.342-3-3V11.487
   l-4.506,4.505c-0.585,0.586-1.354,0.879-2.121,0.879s-1.536-0.293-2.121-0.879c-1.172-1.172-1.172-3.07,0-4.242L14.887,0
   l11.747,11.747C27.805,12.917,27.805,14.816,26.633,15.988z"
      />
    </g>
  </svg>
);

export default ArrowIcon;
