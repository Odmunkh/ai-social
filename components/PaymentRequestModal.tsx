"use client";

import { useState } from "react";
import { toast } from "react-toastify";

type Plan = {
  name: string;
  amount: number;
  credits: number;
};

type PaymentRequestModalProps = {
  open: boolean;
  plan: Plan | null;
  onClose: () => void;
};

export default function PaymentRequestModal({
  open,
  plan,
  onClose,
}: PaymentRequestModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [transactionNote, setTransactionNote] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open || !plan) return null;

  async function submitRequest() {
    if (!plan) {
      toast.error("Plan сонгогдоогүй байна");
      return;
    }

    if (!name || !phone || !transactionNote) {
      toast.error("Нэр, утас, гүйлгээний утгаа бөглөнө үү");
      return;
    }
    if (phone.length !== 8) {
      toast.error("Утасны дугаар 8 оронтой байх ёстой");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/payment-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          phone,
          email,
          plan: plan.name,
          amount: plan.amount,
          transactionNote,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Payment request failed");
      }

      toast.success("Хүсэлт илгээгдлээ");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Хүсэлт илгээх үед алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0b111c] p-5 text-white shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-emerald-400">{plan.name}</p>
            <h2 className="mt-1 text-xl font-semibold">Төлбөрийн хүсэлт</h2>
            <p className="mt-1 text-sm text-slate-400">
              Дүн: {plan.amount.toLocaleString()}₮ · {plan.credits} credit
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5"
          >
            Close
          </button>
        </div>

        <div className="mb-4 rounded-xl border border-pink-500/20 bg-pink-500/10 p-3">
          <p className="text-xs text-pink-200">💳 Төлбөр хийх мэдээлэл</p>

          <p className="mt-2 text-xs text-pink-100">🏦 Банк: Голомт банк</p>

          <p className="mt-1 text-xs text-pink-100">👤 Хүлээн авагч: Odmunkh</p>

          <div className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2">
            <p className="break-all text-xs text-pink-100">
              💳 490015001105408296
            </p>

            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText("490015001105408296");

                toast.success("Дансны дугаар хууллаа");
              }}
              className="shrink-0 rounded-lg border border-white/10 px-2 py-1 text-[11px] text-white hover:bg-white/5"
            >
              Copy
            </button>
          </div>

          <p className="mt-2 text-xs text-pink-200">
            Гүйлгээний утга: Утасны дугаар эсвэл нэрээ бичнэ үү
          </p>
        </div>

        <div className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Нэр"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm outline-none focus:border-emerald-400"
          />

          <input
            value={phone}
            onChange={(e) => {
              const onlyNumbers = e.target.value.replace(/\D/g, "");
              setPhone(onlyNumbers);
            }}
            inputMode="numeric"
            maxLength={8}
            placeholder="Утасны дугаар"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-pink-400"
          />

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email / optional"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm outline-none focus:border-emerald-400"
          />

          <input
            value={transactionNote}
            onChange={(e) => setTransactionNote(e.target.value)}
            placeholder="Гүйлгээний утга"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm outline-none focus:border-emerald-400"
          />

          <button
            onClick={submitRequest}
            disabled={loading}
            className="w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-black disabled:opacity-50"
          >
            {loading ? "Илгээж байна..." : "Төлбөрийн хүсэлт илгээх"}
          </button>
        </div>
      </div>
    </div>
  );
}
