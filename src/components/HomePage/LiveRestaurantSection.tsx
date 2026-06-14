import { getTranslations } from "next-intl/server";
import { mockDemoProductImages } from "@/lib/mockDemoProducts";
import LiveRestaurantShowcase, {
  type OrderStatus,
} from "@/components/HomePage/LiveRestaurantShowcase";

type LiveRestaurantSectionProps = {
  locale: string;
};

export default async function LiveRestaurantSection({
  locale,
}: LiveRestaurantSectionProps) {
  const t = await getTranslations({ locale, namespace: "liveRestaurantSection" });

  const featureIds = [
    "liveTracking",
    "orderStatus",
    "kitchenAlerts",
    "tablesQr",
    "liveStats",
  ] as const;

  const features = featureIds.map((id) => ({
    id,
    title: t(`features.${id}.title`),
    description: t(`features.${id}.description`),
  }));

  const demoImages = [
    mockDemoProductImages.grilledChicken,
    mockDemoProductImages.orangeJuice,
    mockDemoProductImages.cheesecake,
  ] as const;

  const products = [1, 2, 3].map((n) => ({
    name: t(`dashboard.products.${n}.name`),
    orders: t(`dashboard.products.${n}.orders`),
    image: demoImages[n - 1],
  }));

  const opsHighlights = [1, 2, 3, 4, 5].map((n) => ({
    id: String(n),
    title: t(`dashboard.ops.${n}.title`),
    description: t(`dashboard.ops.${n}.description`),
    showStatusLegend: n === 2,
  }));

  const statusLabels = {
    new: t("dashboard.statusNew"),
    progress: t("dashboard.statusProgress"),
    done: t("dashboard.statusDone"),
  };

  const orders = [1, 2, 3].map((n) => ({
    id: t(`dashboard.orders.${n}.id`),
    items: t(`dashboard.orders.${n}.items`),
    time: t(`dashboard.orders.${n}.time`),
    status: t(`dashboard.orders.${n}.status`) as OrderStatus,
  }));

  return (
    <section
      id="live-restaurant"
      className="live-restaurant-section relative border-t border-purple-100/40 dark:border-purple-500/10"
    >
      <div className="home-section-shell relative z-[1] py-10 pb-14 sm:py-12 sm:pb-12 lg:py-20">
        <LiveRestaurantShowcase
          badge={t("badge")}
          title={t("title")}
          titleAccent={t("titleAccent")}
          subtitle={t("subtitle")}
          mobileTitle={t("mobile.title")}
          mobileSubtitle={t("mobile.subtitle")}
          mobileSteps={[
            t("mobile.steps.1"),
            t("mobile.steps.2"),
            t("mobile.steps.3"),
          ]}
          mobileFeatures={[
            { id: "liveUpdates", title: t("mobile.features.liveUpdates") },
            { id: "kitchenAlert", title: t("mobile.features.kitchenAlert") },
            { id: "statusControl", title: t("mobile.features.statusControl") },
          ]}
          mockOrderLabels={{
            badge: t("mobile.mockOrder.badge"),
            tableLabel: t("mobile.mockOrder.tableLabel"),
            tableNumber: t("mobile.mockOrder.tableNumber"),
            itemsLabel: t("mobile.mockOrder.itemsLabel"),
          }}
          features={features}
          restaurantName={t("dashboard.restaurantName")}
          liveLabel={t("dashboard.live")}
          popularTitle={t("dashboard.popularTitle")}
          opsTitle={t("dashboard.opsTitle")}
          liveOrdersTitle={t("dashboard.liveOrdersTitle")}
          opsHighlights={opsHighlights}
          statusLabels={statusLabels}
          products={products}
          orders={orders}
          trustTagline={t("trustTagline")}
        />
      </div>

      <div className="home-cta-transition-bridge" aria-hidden />
    </section>
  );
}
