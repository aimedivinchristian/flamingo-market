import { Navbar }           from "@/components/layout/Navbar";
import { Footer }           from "@/components/layout/Footer";
import { Hero }             from "@/components/home/Hero";
import { CategoryGrid }     from "@/components/home/CategoryGrid";
import { PromoBanners }     from "@/components/home/PromoBanners";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { StatsBanner }      from "@/components/home/StatsBanner";
import { TopSellers }       from "@/components/home/TopSellers";
import { HowItWorks }       from "@/components/home/HowItWorks";
import { Testimonials }     from "@/components/home/Testimonials";
import { Newsletter }       from "@/components/home/Newsletter";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <CategoryGrid />
      <PromoBanners />
      <FeaturedProducts />
      <StatsBanner />
      <TopSellers />
      <HowItWorks />
      <Testimonials />
      <Newsletter />
      <Footer />
    </main>
  );
}
