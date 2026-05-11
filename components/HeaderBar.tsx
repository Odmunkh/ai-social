type Props = {
  creditsLeft: number;
  isPro: boolean;
  onUpgrade: () => void;
  onTestPro: () => void;
};

export default function HeaderBar({
  creditsLeft,
  isPro,
  onUpgrade,
  onTestPro,
}: Props) {
  return (
    <header className="mb-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium text-pink-400">AI Content Studio</p>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Caption + poster үүсгэгч
          </h1>

          <p className="mt-2 max-w-xl text-sm text-slate-400">
            Social media caption болон poster зураг AI-аар үүсгээрэй.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-pink-500/20 bg-pink-500/10 px-4 py-2">
            <p className="text-[11px] text-pink-300/80">Credits</p>
            <p className="text-xl font-semibold text-pink-300">
              {isPro ? "∞" : creditsLeft}
            </p>
          </div>

          <button
            onClick={onUpgrade}
            className="rounded-xl border border-white/10 px-4 py-2 text-xs hover:bg-white/5"
          >
            Upgrade
          </button>

          <button
            onClick={onTestPro}
            className="rounded-xl border border-pink-500/30 px-4 py-2 text-xs text-pink-300 hover:bg-pink-500/10"
          >
            Test Pro
          </button>
        </div>
      </div>
    </header>
  );
}
