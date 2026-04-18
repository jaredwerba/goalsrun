import { Hero } from "@/components/site/hero";
import { Bio } from "@/components/site/bio";
import { Results } from "@/components/site/results";
import { Gallery } from "@/components/site/gallery";
import { PressCta } from "@/components/site/press-cta";

export default function Home() {
  return (
    <>
      <Hero />
      <Bio />
      <Results />
      <Gallery />
      <PressCta />
    </>
  );
}
