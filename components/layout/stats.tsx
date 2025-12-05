const Stats = () => {
  return (
    <section className="w-full py-16 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl md:text-5xl font-bold text-brand mb-2">
              $2M+
            </div>
            <div className="text-muted-foreground">Total Rewards</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-bold text-brand mb-2">
              500+
            </div>
            <div className="text-muted-foreground">Active Opportunities</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-bold text-brand mb-2">
              10K+
            </div>
            <div className="text-muted-foreground">Web3 Builders</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-bold text-brand mb-2">
              50+
            </div>
            <div className="text-muted-foreground">Partner Projects</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
