import { Hero } from "@/components/site/hero";
import { MarathonCards } from "@/components/site/marathon-cards";
import { Bio } from "@/components/site/bio";
import { PerformancePanel } from "@/components/site/performance-panel";
import { Stack } from "@/components/site/stack";
import { Gallery } from "@/components/site/gallery";
import { PressCta } from "@/components/site/press-cta";

export default function Home() {
  return (
    <>
      <Hero />
      <MarathonCards />
      <PerformancePanel />
      <Stack />
      <Bio />
      <Gallery />
      <PressCta />
    </>
  );
}
