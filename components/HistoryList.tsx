type HistoryItem = {
  id: string;
  platform: string;
  product: string;
  business_type: string;
  result: string;
};

type Props = {
  history: HistoryItem[];
  onRefresh: () => void;
  onCopy: (text: string) => void;
  onDelete: (id: string) => void;
};

export default function HistoryList({
  history,
  onRefresh,
  onCopy,
  onDelete,
}: Props) {
  return (
    <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-base font-medium">History</h2>
          <p className="text-xs text-slate-500">Сүүлд үүсгэсэн caption-ууд.</p>
        </div>

        <button
          onClick={onRefresh}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5"
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {history.length === 0 && (
          <p className="text-sm text-slate-500">History алга.</p>
        )}

        {history.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-white/10 bg-black/20 p-4"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-pink-300">
                  {item.platform} · {item.product}
                </p>

                <p className="mt-0.5 text-[11px] text-slate-600">
                  {item.business_type}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onCopy(item.result)}
                  className="rounded-md border border-white/10 px-2 py-1 text-[11px] hover:bg-white/5"
                >
                  Copy
                </button>

                <button
                  onClick={() => onDelete(item.id)}
                  className="rounded-md border border-red-500/30 px-2 py-1 text-[11px] text-red-300 hover:bg-red-500/10"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="line-clamp-4 whitespace-pre-wrap text-xs leading-5 text-slate-400">
              {item.result}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
