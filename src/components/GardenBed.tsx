export type PlantStage = "seed" | "sprout" | "flower";

function PlantIcon({ stage }: { stage: PlantStage }) {
  const petalAngles = [0, 72, 144, 216, 288];

  return (
    <svg viewBox="0 0 44 60" width="36" height="49" aria-hidden="true" data-testid={`plant-${stage}`}>
      {/* Soil mound */}
      <ellipse cx="22" cy="52" rx="16" ry="6" className="fill-soil" />

      {stage === "seed" && (
        <ellipse cx="22" cy="48" rx="3.5" ry="2.5" className="fill-marigold" stroke="var(--color-soil-dark)" strokeWidth="1" />
      )}

      {stage === "sprout" && (
        <g>
          <path
            d="M22 50 C22 40, 22 34, 22 28"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className="text-leaf stroke-leaf fill-none"
          />
          <path d="M22 34 C15 32, 12 26, 13 21 C19 22, 22 28, 22 34 Z" className="fill-leaf" />
          <path d="M22 40 C29 38, 32 33, 31 28 C25 29, 22 34, 22 40 Z" className="fill-leaf" />
        </g>
      )}

      {stage === "flower" && (
        <g>
          <path
            d="M22 50 C22 38, 22 28, 22 20"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className="text-leaf stroke-leaf fill-none"
          />
          <path d="M22 36 C14 34, 11 27, 12 22 C19 23, 22 30, 22 36 Z" className="fill-leaf" />
          <path d="M22 42 C30 40, 33 34, 32 29 C25 30, 22 36, 22 42 Z" className="fill-leaf" />
          <g transform="translate(22 14)">
            {petalAngles.map((angle) => (
              <ellipse
                key={angle}
                cx="0"
                cy="-7"
                rx="4.2"
                ry="6.5"
                className="fill-petal"
                transform={`rotate(${angle})`}
              />
            ))}
            <circle cx="0" cy="0" r="4.5" className="fill-marigold" />
          </g>
        </g>
      )}
    </svg>
  );
}

interface GardenBedProps {
  seeds: number;
  sprouts: number;
  flowers: number;
  maxPlants?: number;
}

/**
 * The signature Home visual: every word the child has met is a plant in the
 * bed. Growth stage mirrors the scheduler's own mastery rule (see
 * lib/scheduler.ts isMastered) rather than inventing a new one:
 *   seed = not yet started (box 0), sprout = learning (box >= 1),
 *   flower = mastered.
 */
export default function GardenBed({ seeds, sprouts, flowers, maxPlants = 40 }: GardenBedProps) {
  const total = seeds + sprouts + flowers;
  if (total === 0) return null;

  // Build a display list capped at maxPlants, keeping the mix proportional
  // so a bed of hundreds of words still reads as "mostly flowers" etc.
  const plants: PlantStage[] = [];
  if (total <= maxPlants) {
    plants.push(...Array(flowers).fill("flower"), ...Array(sprouts).fill("sprout"), ...Array(seeds).fill("seed"));
  } else {
    const scale = maxPlants / total;
    const shownFlowers = Math.max(flowers > 0 ? 1 : 0, Math.round(flowers * scale));
    const shownSprouts = Math.max(sprouts > 0 ? 1 : 0, Math.round(sprouts * scale));
    const shownSeeds = Math.max(0, maxPlants - shownFlowers - shownSprouts);
    plants.push(
      ...Array(shownFlowers).fill("flower"),
      ...Array(shownSprouts).fill("sprout"),
      ...Array(shownSeeds).fill("seed")
    );
  }

  return (
    <div className="rounded-3xl overflow-hidden bg-gradient-to-b from-sky/40 via-mist to-mist">
      <div className="flex items-end gap-1 overflow-x-auto px-4 pt-6 pb-0 scrollbar-none">
        {plants.map((stage, idx) => (
          <PlantIcon key={idx} stage={stage} />
        ))}
      </div>
      <div className="h-3 bg-soil-dark" />
      <div className="flex justify-center gap-4 py-3 text-sm font-semibold text-soil-dark">
        <span>🌱 {seeds}</span>
        <span>🌿 {sprouts}</span>
        <span>🌸 {flowers}</span>
      </div>
    </div>
  );
}
