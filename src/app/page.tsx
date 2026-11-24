import { Navbar }           from "@/components/layout/Navbar";
import { Footer }           from "@/components/layout/Footer";
import { Hero }             from "@/components/home/Hero";
import { BannerStrip }      from "@/components/home/BannerStrip";
import { CategoryGrid }     from "@/components/home/CategoryGrid";
import { PromoBanners }     from "@/components/home/PromoBanners";
import { RecommendedForYou } from "@/components/home/RecommendedForYou";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { StatsBanner }      from "@/components/home/StatsBanner";
import { TopSellers }       from "@/components/home/TopSellers";
import { HowItWorks }       from "@/components/home/HowItWorks";
import { Testimonials }     from "@/components/home/Testimonials";
import { Newsletter }       from "@/components/home/Newsletter";

export const revalidate = 60; // regenerate at most once a minute (fast pages, fresh banners)
export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <BannerStrip />
      <Hero />
      <CategoryGrid />
      <PromoBanners />
      <FeaturedProducts />
      <RecommendedForYou />
      <StatsBanner />
      <TopSellers />
      <HowItWorks />
      <Testimonials />
      <Newsletter />
      <Footer />
    </main>
  );
}
