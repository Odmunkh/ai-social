"use client";

type Props = {
  businessType: string;
  setBusinessType: (v: string) => void;
  product: string;
  setProduct: (v: string) => void;
  goal: string;
  setGoal: (v: string) => void;
  tone: string;
  setTone: (v: string) => void;
  platform: string;
  setPlatform: (v: string) => void;

  headline: string;
  setHeadline: (v: string) => void;
  offer: string;
  setOffer: (v: string) => void;
  cta: string;
  setCta: (v: string) => void;

  logoPreview: string;
  setLogoPreview: (v: string) => void;
  logoPosition: string;
  setLogoPosition: (v: string) => void;
  logoSize: number;
  setLogoSize: (v: number) => void;

  loadingText: boolean;
  loadingImage: boolean;
  onGenerateCaption: () => void;
  onGenerateImage: () => void;
  onClear: () => void;
  hasResult: boolean;
};

export default function GeneratorForm({
  businessType,
  setBusinessType,
  product,
  setProduct,
  goal,
  setGoal,
  tone,
  setTone,
  platform,
  setPlatform,
  headline,
  setHeadline,
  offer,
  setOffer,
  cta,
  setCta,
  logoPreview,
  setLogoPreview,
  logoPosition,
  setLogoPosition,
  logoSize,
  setLogoSize,
  loadingText,
  loadingImage,
  onGenerateCaption,
  onGenerateImage,
  onClear,
  hasResult,
}: Props) {
  function handleLogoUpload(file?: File) {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setLogoPreview(String(reader.result));
    };

    reader.readAsDataURL(file);
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-white">
      <div className="mb-5">
        <h2 className="text-base font-medium">Мэдээлэл</h2>
        <p className="mt-1 text-xs text-slate-500">
          Богино, тодорхой мэдээлэл бичээрэй.
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1.5 block text-xs text-slate-400">Бизнес</label>
          <input
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            placeholder="Coffee shop"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-pink-400"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-slate-400">
            Бүтээгдэхүүн
          </label>
          <input
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="Iced latte"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-pink-400"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-slate-400">Зорилго</label>
          <select
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-pink-400"
          >
            <option value="">Сонгох</option>
            <option value="Захиалга нэмэх">Захиалга нэмэх</option>
            <option value="Шинэ бүтээгдэхүүн танилцуулах">
              Шинэ бүтээгдэхүүн танилцуулах
            </option>
            <option value="Хямдрал зарлах">Хямдрал зарлах</option>
            <option value="Brand awareness нэмэх">Brand awareness нэмэх</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs text-slate-400">Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-pink-400"
            >
              <option>Найрсаг</option>
              <option>Мэргэжлийн</option>
              <option>Хөгжилтэй</option>
              <option>Premium</option>
              <option>Борлуулалттай</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-slate-400">
              Platform
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-pink-400"
            >
              <option>Facebook</option>
              <option>Instagram</option>
              <option>TikTok</option>
            </select>
          </div>
        </div>

        <div className="border-t border-white/10 pt-3">
          <p className="mb-3 text-xs font-medium text-slate-300">Poster text</p>

          <div className="space-y-3">
            <input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Headline: Summer Sale"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-pink-400"
            />

            <input
              value={offer}
              onChange={(e) => setOffer(e.target.value)}
              placeholder="Offer: 30% OFF"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-pink-400"
            />

            <input
              value={cta}
              onChange={(e) => setCta(e.target.value)}
              placeholder="CTA: Order now"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-pink-400"
            />
          </div>
        </div>

        <div className="border-t border-white/10 pt-3">
          <p className="mb-3 text-xs font-medium text-slate-300">Brand logo</p>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleLogoUpload(e.target.files?.[0])}
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-xs text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-pink-500 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white"
          />

          {logoPreview && (
            <div className="mt-3 space-y-3">
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="h-12 object-contain"
                />
              </div>

              <select
                value={logoPosition}
                onChange={(e) => setLogoPosition(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-pink-400"
              >
                <option value="top-left">Top left</option>
                <option value="top-right">Top right</option>
                <option value="bottom-left">Bottom left</option>
                <option value="bottom-right">Bottom right</option>
              </select>

              <div>
                <label className="mb-1.5 block text-xs text-slate-400">
                  Logo size: {logoSize}px
                </label>

                <input
                  type="range"
                  min="40"
                  max="160"
                  value={logoSize}
                  onChange={(e) => setLogoSize(Number(e.target.value))}
                  className="w-full accent-pink-500"
                />
              </div>

              <button
                onClick={() => setLogoPreview("")}
                type="button"
                className="w-full rounded-xl border border-red-500/30 px-3 py-2 text-xs text-red-300 hover:bg-red-500/10"
              >
                Logo устгах
              </button>
            </div>
          )}
        </div>

        <div className="space-y-2 pt-2">
          <button
            onClick={onGenerateCaption}
            disabled={loadingText || loadingImage}
            className="w-full rounded-xl bg-pink-500 px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loadingText ? "Caption үүсгэж байна..." : "Caption үүсгэх"}
          </button>

          <button
            onClick={onGenerateImage}
            disabled={loadingText || loadingImage}
            className="w-full rounded-xl border border-pink-400/40 bg-pink-500/10 px-4 py-2.5 text-sm font-medium text-pink-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loadingImage ? "Poster үүсгэж байна..." : "Poster үүсгэх"}
          </button>

          {hasResult && (
            <button
              onClick={onClear}
              className="w-full rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5"
            >
              Цэвэрлэх
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
