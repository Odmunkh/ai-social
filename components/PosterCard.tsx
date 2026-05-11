import { RefObject } from "react";

type Props = {
  generatedImage: string;
  headline: string;
  offer: string;
  cta: string;
  posterRef: RefObject<HTMLDivElement | null>;
  onDownload: () => void;
};

export default function PosterCard({
  generatedImage,
  posterRef,
  onDownload,
}: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-white">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-base font-medium">Poster</h2>
          <p className="text-xs text-slate-500">Бэлэн design poster.</p>
        </div>

        {generatedImage && (
          <button
            onClick={onDownload}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5"
          >
            Download
          </button>
        )}
      </div>

      <div className="flex min-h-[380px] items-center justify-center rounded-xl border border-white/10 bg-black/20 p-3">
        {generatedImage ? (
          <div ref={posterRef} className="overflow-hidden rounded-xl">
            <img
              src={generatedImage}
              alt="Generated poster"
              className="max-h-[620px] w-full object-contain"
            />
          </div>
        ) : (
          <p className="text-sm text-slate-500">Poster энд гарна.</p>
        )}
      </div>
    </div>
  );
}
