"use client";

import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { toast } from "react-toastify";
import { supabase } from "@/lib/supabase";

import HeaderBar from "@/components/HeaderBar";
import GeneratorForm from "@/components/GeneratorForm";
import CaptionCard from "@/components/CaptionCard";
import PosterCard from "@/components/PosterCard";
import HistoryList from "@/components/HistoryList";

import PricingModal from "@/components/PricingModal";
import PaymentRequestModal from "@/components/PaymentRequestModal";

type SelectedPlan = {
  name: string;
  amount: number;
  credits: number;
};

export default function HomePage() {
  const [businessType, setBusinessType] = useState("");
  const [product, setProduct] = useState("");
  const [goal, setGoal] = useState("");
  const [tone, setTone] = useState("Найрсаг");
  const [platform, setPlatform] = useState("Facebook");

  const [headline, setHeadline] = useState("");
  const [offer, setOffer] = useState("");
  const [cta, setCta] = useState("Order now");

  const [result, setResult] = useState("");
  const [generatedImage, setGeneratedImage] = useState("");

  const [loadingText, setLoadingText] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);

  const [history, setHistory] = useState<any[]>([]);

  const [creditsLeft, setCreditsLeft] = useState(3);

  const [pricingOpen, setPricingOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const [selectedPlan, setSelectedPlan] = useState<SelectedPlan | null>(null);

  const [isPro, setIsPro] = useState(false);

  const posterRef = useRef<HTMLDivElement>(null);
  const [checkPhone, setCheckPhone] = useState("");
  const [checkEmail, setCheckEmail] = useState("");

  const [logoPreview, setLogoPreview] = useState("");
  const [logoPosition, setLogoPosition] = useState("top-left");
  const [logoSize, setLogoSize] = useState(80);

  const [clientId, setClientId] = useState("");

  useEffect(() => {
    const savedCredits = localStorage.getItem("free_credits");

    if (savedCredits) {
      setCreditsLeft(Number(savedCredits));
    } else {
      localStorage.setItem("free_credits", "3");
    }

    let savedClientId = localStorage.getItem("client_id");

    if (!savedClientId) {
      savedClientId = crypto.randomUUID();
      localStorage.setItem("client_id", savedClientId);
    }

    setClientId(savedClientId);
  }, []);
  useEffect(() => {
    if (clientId) {
      loadHistory(clientId);
    }
  }, [clientId]);
  async function loadHistory(id = clientId) {
    if (!id) return;

    const { data, error } = await supabase
      .from("generations")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: false })
      .limit(8);

    if (error) {
      console.error(error);
      return;
    }

    setHistory(data || []);
  }

  function validateForm() {
    if (!businessType || !product || !goal) {
      toast.error("Мэдээллээ бүрэн бөглөнө үү");

      return false;
    }

    return true;
  }

  function updateCredits(amount: number) {
    const updated = Math.max(creditsLeft - amount, 0);

    setCreditsLeft(updated);

    localStorage.setItem("free_credits", updated.toString());
  }

  async function saveGeneration(text: string) {
    if (!clientId) return;

    await supabase.from("generations").insert({
      client_id: clientId,
      business_type: businessType,
      product,
      goal,
      tone,
      platform,
      result: text,
    });

    await loadHistory(clientId);
  }

  async function handleGenerateCaption() {
    if (!validateForm()) return;

    if (!isPro && creditsLeft <= 0) {
      setPricingOpen(true);

      toast.error("Үнэгүй эрх дууссан байна");

      return;
    }

    setLoadingText(true);
    setResult("");

    try {
      const res = await fetch("/api/generate-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessType,
          product,
          goal,
          tone,
          platform,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Generate failed");
      }

      setResult(data.result);

      await saveGeneration(data.result);

      if (!isPro) {
        updateCredits(1);
      }

      toast.success("Caption үүслээ");
    } catch (error) {
      console.error(error);

      toast.error("Caption үүсгэх үед алдаа гарлаа");
    } finally {
      setLoadingText(false);
    }
  }

  async function handleGenerateImage() {
    if (!validateForm()) return;

    if (!isPro && creditsLeft <= 0) {
      setPricingOpen(true);

      toast.error("Үнэгүй эрх дууссан байна");

      return;
    }

    setLoadingImage(true);

    setGeneratedImage("");

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessType,
          product,
          goal,
          tone,
          platform,
          headline,
          offer,
          cta,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Image failed");
      }

      if (data.image) {
        setGeneratedImage(`data:image/png;base64,${data.image}`);

        if (!isPro) {
          updateCredits(1);
        }

        toast.success("Poster үүслээ");
      }
    } catch (error) {
      console.error(error);

      toast.error("Poster үүсгэх үед алдаа гарлаа");
    } finally {
      setLoadingImage(false);
    }
  }

  async function copyText(text?: string) {
    await navigator.clipboard.writeText(text || result);

    toast.success("Хууллаа");
  }

  async function downloadPoster() {
    if (!generatedImage) return;

    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = "poster.png";
    link.click();

    toast.success("Poster татагдлаа");
  }
  async function checkPlan() {
    try {
      const res = await fetch("/api/check-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: checkPhone,
          email: checkEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Check failed");
      }

      setIsPro(true);

      setCreditsLeft(data.credits || 0);

      localStorage.setItem("free_credits", String(data.credits || 0));

      toast.success(`${data.plan} эрх идэвхжлээ`);
    } catch (error) {
      console.error(error);

      toast.error("Эрх шалгах үед алдаа гарлаа");
    }
  }
  function clearAll() {
    setBusinessType("");
    setProduct("");
    setGoal("");
    setTone("Найрсаг");
    setPlatform("Facebook");

    setHeadline("");
    setOffer("");
    setCta("Order now");

    setResult("");
    setGeneratedImage("");
  }

  async function deleteHistory(id: string) {
    const { error } = await supabase
      .from("generations")
      .delete()
      .eq("id", id)
      .eq("client_id", clientId);

    if (error) {
      toast.error("Устгах үед алдаа гарлаа");

      return;
    }

    setHistory((prev) => prev.filter((item) => item.id !== id));

    toast.success("Устгалаа");
  }

  return (
    <>
      <main className="min-h-screen bg-[#050711] px-4 py-6 text-white">
        <div className="mx-auto max-w-6xl">
          <HeaderBar
            creditsLeft={creditsLeft}
            isPro={isPro}
            onUpgrade={() => setPricingOpen(true)}
            onTestPro={() => {
              setIsPro(true);

              toast.success("Pro enabled");
            }}
          />
          <div className="mb-5 rounded-2xl border border-pink-500/20 bg-pink-500/10 p-4">
            <div className="flex flex-col gap-3 md:flex-row">
              <input
                value={checkPhone}
                onChange={(e) => setCheckPhone(e.target.value)}
                placeholder="Утас"
                className="flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-pink-400"
              />

              <input
                value={checkEmail}
                onChange={(e) => setCheckEmail(e.target.value)}
                placeholder="Email / optional"
                className="flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-pink-400"
              />

              <button
                type="button"
                onClick={checkPlan}
                className="rounded-xl bg-pink-500 px-5 py-3 text-sm font-medium text-white"
              >
                Эрх шалгах
              </button>
            </div>

            <p className="mt-2 text-xs text-pink-200/80">
              Төлбөр хийсний дараа утас эсвэл email-ээ оруулаад эрхээ
              идэвхжүүлнэ.
            </p>
          </div>
          <div className="grid gap-5 lg:grid-cols-[360px_1fr] lg:items-start">
            <GeneratorForm
              businessType={businessType}
              setBusinessType={setBusinessType}
              product={product}
              setProduct={setProduct}
              goal={goal}
              setGoal={setGoal}
              tone={tone}
              setTone={setTone}
              platform={platform}
              setPlatform={setPlatform}
              headline={headline}
              setHeadline={setHeadline}
              offer={offer}
              setOffer={setOffer}
              cta={cta}
              setCta={setCta}
              logoPreview={logoPreview}
              setLogoPreview={setLogoPreview}
              logoPosition={logoPosition}
              setLogoPosition={setLogoPosition}
              logoSize={logoSize}
              setLogoSize={setLogoSize}
              loadingText={loadingText}
              loadingImage={loadingImage}
              onGenerateCaption={handleGenerateCaption}
              onGenerateImage={handleGenerateImage}
              onClear={clearAll}
              hasResult={!!result || !!generatedImage}
            />
            <section className="grid gap-5 lg:grid-cols-2">
              <CaptionCard result={result} onCopy={() => copyText()} />

              <PosterCard
                generatedImage={generatedImage}
                headline={headline}
                offer={offer}
                cta={cta}
                posterRef={posterRef}
                onDownload={downloadPoster}
              />
            </section>
          </div>

          <HistoryList
            history={history}
            onRefresh={loadHistory}
            onCopy={copyText}
            onDelete={deleteHistory}
          />
        </div>
      </main>

      <PricingModal
        open={pricingOpen}
        onClose={() => setPricingOpen(false)}
        onSelectPlan={(plan) => {
          setSelectedPlan(plan);

          setPricingOpen(false);

          setPaymentOpen(true);
        }}
      />

      <PaymentRequestModal
        open={paymentOpen}
        plan={selectedPlan}
        onClose={() => setPaymentOpen(false)}
      />
    </>
  );
}
