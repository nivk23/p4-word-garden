import { describe, it, expect } from "vitest";
import { render, cleanup } from "@testing-library/react";
import GardenBed from "../src/components/GardenBed";

function counts(container: HTMLElement) {
  return {
    seed: container.querySelectorAll('[data-testid="plant-seed"]').length,
    sprout: container.querySelectorAll('[data-testid="plant-sprout"]').length,
    flower: container.querySelectorAll('[data-testid="plant-flower"]').length,
  };
}

describe("GardenBed", () => {
  it("renders nothing when there are no words yet", () => {
    const { container } = render(<GardenBed seeds={0} sprouts={0} flowers={0} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders one plant per word, matching each growth-stage count exactly under the cap", () => {
    const { container } = render(<GardenBed seeds={2} sprouts={3} flowers={4} />);
    expect(counts(container)).toEqual({ seed: 2, sprout: 3, flower: 4 });
    cleanup();
  });

  it("shows the seed/sprout/flower totals as a caption regardless of the display cap", () => {
    const { getByText } = render(<GardenBed seeds={2} sprouts={3} flowers={4} />);
    expect(getByText(/🌱 2/)).toBeTruthy();
    expect(getByText(/🌿 3/)).toBeTruthy();
    expect(getByText(/🌸 4/)).toBeTruthy();
    cleanup();
  });

  it("caps the number of plants drawn once the word count is large, keeping at least one of each non-zero stage", () => {
    const { container } = render(
      <GardenBed seeds={200} sprouts={200} flowers={5} maxPlants={40} />
    );
    const shown = counts(container);
    expect(shown.seed + shown.sprout + shown.flower).toBeLessThanOrEqual(40);
    // A handful of mastered words shouldn't vanish just because there are
    // hundreds of seeds/sprouts alongside them.
    expect(shown.flower).toBeGreaterThan(0);
    expect(shown.sprout).toBeGreaterThan(0);
    expect(shown.seed).toBeGreaterThan(0);
  });
});
