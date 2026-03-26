"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type PaymentRow = {
  id: string;
  resume_id: string;
  payer_name: string | null;
  transaction_note: string | null;
  bank_note?: string | null;
  status: string;
  created_at: string;
};

type FilterStatus = "pending" | "approved" | "all";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("pending");
  const [copiedMessage, setCopiedMessage] = useState("");

  const fetchPayments = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("payments")
        .select(
          "id, resume_id, payer_name, transaction_note, bank_note, status, created_at",
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      setPayments(data || []);
    } catch (error) {
      console.error("Fetch payments error:", error);
      alert("Payment жагсаалт унших үед алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  };

  const approvePayment = async (payment: PaymentRow) => {
    try {
      setApprovingId(payment.id);

      const { error: paymentError } = await supabase
        .from("payments")
        .update({ status: "approved" })
        .eq("id", payment.id);

      if (paymentError) throw paymentError;

      const { error: resumeError } = await supabase
        .from("resumes")
        .update({ status: "approved" })
        .eq("id", payment.resume_id);

      if (resumeError) throw resumeError;

      await fetchPayments();
    } catch (error) {
      console.error("Approve error:", error);
      alert("Approve хийх үед алдаа гарлаа.");
    } finally {
      setApprovingId(null);
    }
  };

  const copyValue = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedMessage(`${label} хуулагдлаа`);
      setTimeout(() => setCopiedMessage(""), 1500);
    } catch (error) {
      console.error("Copy error:", error);
      alert("Хуулах үед алдаа гарлаа.");
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    let result = [...payments];

    if (statusFilter !== "all") {
      result = result.filter((payment) => payment.status === statusFilter);
    }

    const query = searchTerm.trim().toLowerCase();

    if (query) {
      result = result.filter((payment) => {
        const transactionNote = (payment.transaction_note || "").toLowerCase();
        const payerName = (payment.payer_name || "").toLowerCase();
        const resumeId = (payment.resume_id || "").toLowerCase();

        return (
          transactionNote.includes(query) ||
          payerName.includes(query) ||
          resumeId.includes(query)
        );
      });
    }

    return result;
  }, [payments, searchTerm, statusFilter]);

  const pendingCount = payments.filter((p) => p.status === "pending").length;
  const approvedCount = payments.filter((p) => p.status === "approved").length;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Төлбөрийн хүсэлтүүд
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Шинээр ирсэн pending хүсэлтүүдийг эндээс approve хийнэ.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchPayments}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
          >
            Шинэчлэх
          </button>
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="mt-1 text-2xl font-bold text-amber-600">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-500">Approved</p>
            <p className="mt-1 text-2xl font-bold text-green-600">
              {approvedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-500">Нийт</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {payments.length}
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Гүйлгээний кодоор хайх
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Жишээ: CV-AB12CD"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
              />
              <p className="mt-2 text-xs text-gray-500">
                Гүйлгээний утга, payer нэр, эсвэл resume id-гаар бас хайж болно.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Төлөв
              </label>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as FilterStatus)
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black md:w-44"
              >
                <option value="pending">Зөвхөн pending</option>
                <option value="approved">Зөвхөн approved</option>
                <option value="all">Бүгд</option>
              </select>
            </div>
          </div>
        </div>

        {copiedMessage && (
          <div className="mb-4 rounded-xl bg-green-50 p-3 text-sm text-green-700">
            {copiedMessage}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
            Уншиж байна...
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
            Таарсан payment request алга байна.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <div
                key={payment.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-gray-500">Payer</p>
                    <p className="text-base font-semibold text-gray-900">
                      {payment.payer_name || "-"}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      payment.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {payment.status}
                  </span>
                </div>

                <div className="mt-4 rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Гүйлгээний утга
                  </p>

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                    <p className="break-all text-lg font-bold text-gray-900">
                      {payment.transaction_note || "-"}
                    </p>

                    {payment.transaction_note && (
                      <button
                        type="button"
                        onClick={() =>
                          copyValue(
                            payment.transaction_note || "",
                            "Гүйлгээний утга",
                          )
                        }
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100"
                      >
                        Хуулах
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-gray-700">
                  <p>
                    <span className="font-medium">Resume ID:</span>{" "}
                    {payment.resume_id}
                  </p>

                  <p>
                    <span className="font-medium">Банкны note:</span>{" "}
                    {payment.bank_note || "-"}
                  </p>

                  <p>
                    <span className="font-medium">Created at:</span>{" "}
                    {new Date(payment.created_at).toLocaleString()}
                  </p>
                </div>

                {payment.status === "pending" && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => approvePayment(payment)}
                      disabled={approvingId === payment.id}
                      className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                    >
                      {approvingId === payment.id
                        ? "Approve хийж байна..."
                        : "Approve"}
                    </button>

                    <button
                      type="button"
                      onClick={() => copyValue(payment.resume_id, "Resume ID")}
                      className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                    >
                      Resume ID хуулах
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
