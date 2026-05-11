type Props = {
  result: string;
  onCopy: () => void;
};

export default function CaptionCard({ result, onCopy }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-base font-medium">Caption</h2>
          <p className="text-xs text-slate-500">Шууд copy хийгээд ашиглана.</p>
        </div>

        {result && (
          <button
            onClick={onCopy}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5"
          >
            Copy
          </button>
        )}
      </div>

      <div className="min-h-[380px] whitespace-pre-wrap rounded-xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-slate-300">
        {result || "Caption энд гарна."}
      </div>
    </div>
  );
}
