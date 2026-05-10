const AboutPage = () => {
  return (
    <div>
      <div className="page-hero">
        <h1 className="font-condensed text-4xl font-bold tracking-wide">About DAS Instruments</h1>
        <p className="mt-2" style={{ color: 'rgba(255,255,255,0.7)' }}>Chennai's trusted partner in scientific & industrial instrumentation</p>
      </div>
      <div className="py-16 px-8 max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-12">
          <div>
            <div className="section-label">Our Story</div>
            <div className="section-title mb-4">Powering Research Since 2009</div>
            <p className="leading-relaxed mb-4" style={{ color: 'hsl(var(--muted-text))' }}>
              DAS Instruments & Solutions was founded in Chennai with a vision to bridge the gap between world-class scientific instrumentation and Indian research institutions. Over 15 years, we have supplied equipment to IITs, NITs, CSIR labs, and major PSUs.
            </p>
            <p className="leading-relaxed" style={{ color: 'hsl(var(--muted-text))' }}>
              Our portfolio spans electrochemical workstations, precision lab equipment, industrial automation, and energy storage testing — all backed by comprehensive after-sales support.
            </p>
          </div>
          <div className="rounded-xl p-8" style={{ background: 'hsl(var(--navy))', color: '#fff' }}>
            <div className="font-condensed text-xl font-bold mb-6" style={{ color: 'hsl(var(--gold2))' }}>Key Milestones</div>
            {[['2009', 'Founded in Chennai'], ['2012', 'First IIT Madras supply'], ['2015', 'Launched electrochemical division'], ['2018', 'Crossed 100+ institutional clients'], ['2021', 'Industrial automation vertical'], ['2024', 'Pan-India service network']].map(([y, e]) => (
              <div key={y} className="flex gap-4 mb-3 items-start">
                <span className="font-condensed font-bold text-base min-w-[40px]" style={{ color: 'hsl(var(--gold))' }}>{y}</span>
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>{e}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl p-8" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="section-label">Our Clients</div>
          <div className="section-title mb-6">Trusted by India's Best</div>
          <div className="flex flex-wrap gap-3">
            {['IIT Madras', 'IIT Bombay', 'NIT Trichy', 'CSIR-NCL', 'BPCL', 'HPCL', 'ONGC', 'DRDO', 'ISRO', 'Anna University', 'VIT', 'SRM University', 'IOCL', 'Tata Power'].map(c => (
              <span key={c} className="text-sm font-medium px-3.5 py-1.5 rounded border" style={{ background: 'hsl(var(--off))', borderColor: 'hsl(var(--off2))', color: 'hsl(var(--navy))' }}>{c}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
