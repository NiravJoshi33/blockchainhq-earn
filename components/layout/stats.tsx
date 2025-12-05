import {
  getPlatformStats,
  formatCurrency,
  formatNumber,
} from "@/lib/supabase/services/stats";

const Stats = async () => {
  const stats = await getPlatformStats();

  return (
    <section className="w-full py-16 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl md:text-5xl font-bold text-brand mb-2">
              {formatCurrency(stats.totalRewards)}+
            </div>
            <div className="text-muted-foreground">Total Rewards</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-bold text-brand mb-2">
              {formatNumber(stats.activeOpportunities)}+
            </div>
            <div className="text-muted-foreground">Active Opportunities</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-bold text-brand mb-2">
              {formatNumber(stats.totalBuilders)}+
            </div>
            <div className="text-muted-foreground">Web3 Builders</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-bold text-brand mb-2">
              {formatNumber(stats.partnerProjects)}+
            </div>
            <div className="text-muted-foreground">Partner Projects</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
