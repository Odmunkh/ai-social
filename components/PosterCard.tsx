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
  headline,
  offer,
  cta,
  posterRef,
  onDownload,
}: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-white">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-base font-medium">Poster</h2>
          <p className="text-xs text-slate-500">
            Монгол текст overlay-тэй татна.
          </p>
        </div>

        {generatedImage && (
          <button
            type="button"
            onClick={onDownload}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5"
          >
            Download
          </button>
        )}
      </div>

      <div className="flex min-h-[380px] items-center justify-center rounded-xl border border-white/10 bg-black/20 p-3">
        {generatedImage ? (
          <div
            ref={posterRef}
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: "16px",
              backgroundColor: "#000000",
              color: "#ffffff",
              width: "100%",
            }}
          >
            <img
              src={generatedImage}
              alt="Generated poster"
              style={{
                display: "block",
                width: "100%",
                height: "auto",
                maxHeight: "620px",
                objectFit: "contain",
              }}
            />

            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.25), rgba(0,0,0,0))",
              }}
            />

            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                padding: "24px",
              }}
            >
              {offer && (
                <div
                  style={{
                    display: "inline-flex",
                    marginBottom: "12px",
                    borderRadius: "999px",
                    backgroundColor: "#ec4899",
                    color: "#ffffff",
                    padding: "6px 16px",
                    fontSize: "14px",
                    fontWeight: 800,
                    boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
                  }}
                >
                  {offer}
                </div>
              )}

              {headline && (
                <h2
                  style={{
                    maxWidth: "90%",
                    whiteSpace: "pre-line",
                    color: "#ffffff",
                    fontSize: "32px",
                    lineHeight: "1.12",
                    fontWeight: 900,
                    margin: 0,
                    textShadow: "0 8px 24px rgba(0,0,0,0.75)",
                  }}
                >
                  {headline}
                </h2>
              )}

              {cta && (
                <div
                  style={{
                    display: "inline-flex",
                    marginTop: "16px",
                    borderRadius: "14px",
                    backgroundColor: "#ffffff",
                    color: "#000000",
                    padding: "10px 20px",
                    fontSize: "14px",
                    fontWeight: 800,
                    boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
                  }}
                >
                  {cta}
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Poster энд гарна.</p>
        )}
      </div>
    </div>
  );
}
