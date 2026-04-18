import type { RouteData } from "@/lib/routes";

const VB_W = 160;
const VB_H = 90;
const PAD = 12;

export function RouteMap({
  route,
  slug,
}: {
  route: RouteData;
  slug: string;
}) {
  const lngs = route.points.map((p) => p[0]);
  const lats = route.points.map((p) => p[1]);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  const lngRange = maxLng - minLng || 0.0001;
  const latRange = maxLat - minLat || 0.0001;

  const latCorr = Math.cos(((minLat + maxLat) / 2) * (Math.PI / 180));
  const worldW = lngRange * latCorr;
  const worldH = latRange;

  const scale = Math.min(
    (VB_W - 2 * PAD) / worldW,
    (VB_H - 2 * PAD) / worldH,
  );

  const centerLng = (minLng + maxLng) / 2;
  const centerLat = (minLat + maxLat) / 2;

  const project = ([lng, lat]: readonly [number, number]) => {
    const x = VB_W / 2 + (lng - centerLng) * latCorr * scale;
    const y = VB_H / 2 - (lat - centerLat) * scale;
    return [x, y] as const;
  };

  const pts = route.points.map(project);
  const d = pts
    .map(([x, y], i) =>
      i === 0 ? `M${x.toFixed(2)},${y.toFixed(2)}` : `L${x.toFixed(2)},${y.toFixed(2)}`,
    )
    .join(" ");

  const [sx, sy] = pts[0];
  const [ex, ey] = pts[pts.length - 1];
  const glowId = `route-glow-${slug}`;
  const bgId = `route-bg-${slug}`;

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full block"
    >
      <defs>
        <radialGradient id={bgId} cx="28%" cy="22%" r="90%">
          <stop offset="0%" stopColor="#1a1a1c" />
          <stop offset="55%" stopColor="#0d0d10" />
          <stop offset="100%" stopColor="#050506" />
        </radialGradient>
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
      </defs>

      <rect width={VB_W} height={VB_H} fill={`url(#${bgId})`} />

      {[32, 64, 96, 128].map((x) => (
        <line
          key={`v${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={VB_H}
          stroke="#ffffff"
          strokeOpacity="0.035"
          strokeWidth="0.4"
        />
      ))}
      {[22, 45, 68].map((y) => (
        <line
          key={`h${y}`}
          x1={0}
          y1={y}
          x2={VB_W}
          y2={y}
          stroke="#ffffff"
          strokeOpacity="0.035"
          strokeWidth="0.4"
        />
      ))}

      <path
        d={d}
        fill="none"
        stroke="#fb923c"
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.35"
        filter={`url(#${glowId})`}
      />
      <path
        d={d}
        fill="none"
        stroke="#fafafa"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle cx={sx} cy={sy} r="2.8" fill="#fb923c" fillOpacity="0.25" />
      <circle cx={sx} cy={sy} r="1.4" fill="#fb923c" />

      {!route.isLoop && (
        <>
          <circle cx={ex} cy={ey} r="2.8" fill="#fafafa" fillOpacity="0.25" />
          <circle
            cx={ex}
            cy={ey}
            r="1.4"
            fill="#fafafa"
            stroke="#fb923c"
            strokeWidth="0.5"
          />
        </>
      )}
    </svg>
  );
}
