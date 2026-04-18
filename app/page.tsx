import { Hero } from "@/components/site/hero";
import { MarathonCards } from "@/components/site/marathon-cards";
import { Bio } from "@/components/site/bio";
import { VO2Max } from "@/components/site/vo2-max";
import { Gallery } from "@/components/site/gallery";
import { PressCta } from "@/components/site/press-cta";

export default function Home() {
  return (
    <>
      <Hero />
      <MarathonCards />
      <Bio />
      <VO2Max />
      <Gallery />
      <PressCta />
    </>
  );
}
