export default function HowItWorks() {
  const steps = [
    {
      icon: "📋",
      step: "01",
      title: "Upload your list",
      desc: "Take a photo, type it out, or send a PDF of your shopping list.",
    },
    {
      icon: "💬",
      step: "02",
      title: "Get an estimate",
      desc: "We review your list and send you a price estimate via WhatsApp.",
    },
    {
      icon: "✅",
      step: "03",
      title: "Confirm & pay",
      desc: "Approve the estimate and we head to the market on your behalf.",
    },
    {
      icon: "🚚",
      step: "04",
      title: "Receive delivery",
      desc: "Fresh items delivered to your door within your chosen timeframe.",
    },
  ];

  return (
    <section id="how" className="py-14 px-4 bg-ruz-cream">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 text-center">
          <span className="inline-block bg-ruz-orange/10 text-ruz-orange text-xs font-display font-700 uppercase tracking-widest px-3 py-1 rounded-full mb-3">
            Simple Process
          </span>
          <h2 className="font-display text-3xl font-800 text-ruz-dark">How MarketRuz works</h2>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {steps.map((s, i) => (
            <div key={i} className="card-lift bg-white rounded-2xl p-5 border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{s.icon}</span>
                <span className="font-display font-700 text-gray-200 text-xl">{s.step}</span>
              </div>
              <h3 className="font-display font-700 text-ruz-dark text-sm mb-1">{s.title}</h3>
              <p className="text-ruz-muted text-xs font-body leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}