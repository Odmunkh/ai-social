"use client";

type PricingModalProps = {
  open: boolean;
  onClose: () => void;
  onSelectPlan: (plan: {
    name: string;
    amount: number;
    credits: number;
  }) => void;
};

const plans = [
  {
    name: "Starter",
    price: "9,900₮",
    amount: 9900,
    credits: 30,
    desc: "Жижиг бизнес, туршилтад",
  },
  {
    name: "Pro",
    price: "29,000₮",
    amount: 29000,
    credits: 150,
    desc: "Идэвхтэй пост хийдэг бизнес",
  },
  {
    name: "Business",
    price: "59,000₮",
    amount: 59000,
    credits: 400,
    desc: "Agency, online shop, маркетинг баг",
  },
];

export default function PricingModal({
  open,
  onClose,
  onSelectPlan,
}: PricingModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-4xl rounded-2xl border border-white/10 bg-[#0b111c] p-5 text-white shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-emerald-400">Upgrade</p>
            <h2 className="mt-1 text-xl font-semibold">Pro эрх авах</h2>
            <p className="mt-1 text-sm text-slate-400">
              Caption болон poster зураг илүү олон үүсгэх эрх авна.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5"
          >
            Close
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <h3 className="text-base font-medium">{plan.name}</h3>

              <p className="mt-2 text-2xl font-semibold text-emerald-300">
                {plan.price}
              </p>

              <p className="mt-1 text-xs text-slate-500">{plan.desc}</p>

              <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-xs text-slate-400">Багцын эрх</p>
                <p className="mt-1 text-sm text-white">
                  {plan.credits} content credit
                </p>
              </div>

              <button
                onClick={() => onSelectPlan(plan)}
                className="mt-4 w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-black"
              >
                Сонгох
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
