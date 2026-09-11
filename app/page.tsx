import BestSellers from "../components/BestSellers";
import CategoryGrid from "../components/CategoryGrid";
import HeroBanner from "../components/HeroBanner";
import RecentlyViewed from "../components/RecentlyViewed";
import Recommended from "../components/Recommended";
import TodayDeals from "../components/TodayDeals";

export default function HomePage() {
  return (
    <main>
      <HeroBanner />
      <CategoryGrid />
      <TodayDeals />
      <BestSellers />
      <Recommended />
      <RecentlyViewed />
    </main>
  );
}
