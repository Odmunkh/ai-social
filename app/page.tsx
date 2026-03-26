"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import StepCircleStepper from "@/components/StepCircleStepper";
import ResumePreview from "@/components/ResumePreview";
import { steps } from "@/lib/steps";
import { initialFormData } from "@/lib/initialData";
import { supabase } from "@/lib/supabase";

type ExperienceItem = {
  company: string;
  role: string;
  start: string;
  end: string;
  description?: string;
};

type EducationItem = {
  school: string;
  degree: string;
  start: string;
  end: string;
};

type ResumeData = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string | string[];
  languages: string | string[];
};

type FormDataType = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  languages: string[];
};

type CopyRowProps = {
  label: string;
  value: string;
  onCopy: () => void;
};

type InputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  compact?: boolean;
};

type TextareaProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
};

type ChipSelectorProps = {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: string[];
  placeholder?: string;
  error?: string;
};

type LanguageSelectorProps = {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
};

type SelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
};

const DEFAULT_SKILLS = [
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Tailwind CSS",
  "Node.js",
  "Figma",
  "UI/UX",
  "Communication",
  "Problem Solving",
  "Teamwork",
  "Leadership",
  "Photoshop",
  "Illustrator",
  "Excel",
  "Word",
  "PowerPoint",
  "Customer Service",
  "Sales",
  "Marketing",
];

const DEFAULT_LANGUAGES = [
  "Монгол хэл",
  "Англи хэл",
  "Орос хэл",
  "Солонгос хэл",
  "Япон хэл",
  "Хятад хэл",
  "Герман хэл",
];

const LANGUAGE_LEVELS = ["Төрөлх", "Анхан", "Дунд", "Ахисан", "Чөлөөтэй"];

const emptyExperience: ExperienceItem = {
  company: "",
  role: "",
  start: "",
  end: "",
  description: "",
};

const emptyEducation: EducationItem = {
  school: "",
  degree: "",
  start: "",
  end: "",
};

function normalizeInitialData(data: Partial<FormDataType> | any): FormDataType {
  return {
    fullName: data?.fullName || "",
    email: data?.email || "",
    phone: data?.phone || "",
    location: data?.location || "",
    summary: data?.summary || "",
    experience:
      data?.experience?.length > 0
        ? data.experience.map((item: Partial<ExperienceItem>) => ({
            company: item.company || "",
            role: item.role || "",
            start: item.start || "",
            end: item.end || "",
            description: item.description || "",
          }))
        : [{ ...emptyExperience }],
    education:
      data?.education?.length > 0
        ? data.education.map((item: Partial<EducationItem>) => ({
            school: item.school || "",
            degree: item.degree || "",
            start: item.start || "",
            end: item.end || "",
          }))
        : [{ ...emptyEducation }],
    skills: Array.isArray(data?.skills)
      ? data.skills
      : typeof data?.skills === "string" && data.skills.trim()
        ? data.skills
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [],
    languages: Array.isArray(data?.languages)
      ? data.languages
      : typeof data?.languages === "string" && data.languages.trim()
        ? data.languages
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [],
  };
}

function sanitizePhone(value: string): string {
  return value.replace(/[^\d+]/g, "").slice(0, 12);
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value: string): boolean {
  return /^(\+?\d{8,12})$/.test(value);
}

function formatSkillsForSave(skills: string[] | string): string {
  return Array.isArray(skills) ? skills.join(", ") : skills;
}

function formatLanguagesForSave(languages: string[] | string): string {
  return Array.isArray(languages) ? languages.join(", ") : languages;
}

function safeColor(value: string, fallback: string): string {
  if (!value) return fallback;

  if (
    value.includes("lab(") ||
    value.includes("lch(") ||
    value.includes("oklab(") ||
    value.includes("oklch(")
  ) {
    return fallback;
  }

  return value;
}

function sanitizeColors(root: HTMLElement): void {
  const all = root.querySelectorAll("*");

  all.forEach((node) => {
    const el = node as HTMLElement;
    const computed = window.getComputedStyle(el);

    el.style.color = safeColor(computed.color, "#111827");
    el.style.backgroundColor = safeColor(
      computed.backgroundColor,
      "transparent",
    );
    el.style.borderTopColor = safeColor(computed.borderTopColor, "#d1d5db");
    el.style.borderRightColor = safeColor(computed.borderRightColor, "#d1d5db");
    el.style.borderBottomColor = safeColor(
      computed.borderBottomColor,
      "#d1d5db",
    );
    el.style.borderLeftColor = safeColor(computed.borderLeftColor, "#d1d5db");
    el.style.outlineColor = safeColor(computed.outlineColor, "#111827");
    el.style.textDecorationColor = safeColor(
      computed.textDecorationColor,
      "#111827",
    );
  });
}

export default function Page() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormDataType>(
    normalizeInitialData(initialFormData),
  );
  const [aiResumeData, setAiResumeData] = useState<ResumeData | null>(null);
  const [previewReady, setPreviewReady] = useState<boolean>(false);
  const [paymentSubmitted, setPaymentSubmitted] = useState<boolean>(false);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState<string>("");
  const [loadingPreview, setLoadingPreview] = useState<boolean>(false);
  const [submittingPayment, setSubmittingPayment] = useState<boolean>(false);
  const [resumeStatus, setResumeStatus] = useState<string>("draft");
  const [checkingStatus, setCheckingStatus] = useState<boolean>(false);
  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const previewRef = useRef<HTMLDivElement | null>(null);

  const lastStep = steps.length;
  const isReviewStep = currentStep === lastStep;

  useEffect(() => {
    const savedResumeId = localStorage.getItem("resumeId");
    if (savedResumeId) {
      setResumeId(savedResumeId);
    }
  }, []);

  useEffect(() => {
    const loadResumeStatus = async () => {
      if (!resumeId) return;

      try {
        const { data, error } = await supabase
          .from("resumes")
          .select("status, form_data_json, resume_json")
          .eq("id", resumeId)
          .single();

        if (error) throw error;

        setResumeStatus(data.status || "draft");

        if (data.form_data_json) {
          setFormData(normalizeInitialData(data.form_data_json));
        }

        if (data.resume_json) {
          setAiResumeData(data.resume_json);
        }

        const { data: paymentData } = await supabase
          .from("payments")
          .select("transaction_note, status")
          .eq("resume_id", resumeId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (paymentData?.transaction_note) {
          setPaymentReference(paymentData.transaction_note);
        }

        if (data.status === "pending_payment" || data.status === "approved") {
          setPaymentSubmitted(true);
          setPreviewReady(true);
          setCurrentStep(lastStep);
        }
      } catch (error) {
        console.error("Initial status load error:", error);
      }
    };

    loadResumeStatus();
  }, [resumeId, lastStep]);

  const updateField = <K extends keyof FormDataType>(
    field: K,
    value: FormDataType[K],
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const updateExperience = (
    index: number,
    field: keyof ExperienceItem,
    value: string,
  ) => {
    setFormData((prev) => {
      const next = [...prev.experience];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, experience: next };
    });
  };

  const addExperience = () => {
    setFormData((prev) => ({
      ...prev,
      experience: [...prev.experience, { ...emptyExperience }],
    }));
  };

  const removeExperience = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      experience:
        prev.experience.length === 1
          ? [{ ...emptyExperience }]
          : prev.experience.filter((_, i) => i !== index),
    }));
  };

  const updateEducation = (
    index: number,
    field: keyof EducationItem,
    value: string,
  ) => {
    setFormData((prev) => {
      const next = [...prev.education];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, education: next };
    });
  };

  const addEducation = () => {
    setFormData((prev) => ({
      ...prev,
      education: [...prev.education, { ...emptyEducation }],
    }));
  };

  const removeEducation = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      education:
        prev.education.length === 1
          ? [{ ...emptyEducation }]
          : prev.education.filter((_, i) => i !== index),
    }));
  };

  const validateStep = (step: number): boolean => {
    const nextErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.fullName.trim()) nextErrors.fullName = "Нэрээ оруулна уу";

      if (!formData.email.trim()) {
        nextErrors.email = "Имэйл оруулна уу";
      } else if (!isValidEmail(formData.email)) {
        nextErrors.email = "Зөв имэйл оруулна уу";
      }

      if (!formData.phone.trim()) {
        nextErrors.phone = "Утасны дугаар оруулна уу";
      } else if (!isValidPhone(formData.phone)) {
        nextErrors.phone = "Зөв утасны дугаар оруулна уу";
      }

      if (!formData.location.trim()) {
        nextErrors.location = "Байршлаа оруулна уу";
      }
    }

    if (step === 3) {
      const hasValidExperience = formData.experience.some(
        (item) =>
          item.company.trim() || item.role.trim() || item.start || item.end,
      );

      if (!hasValidExperience) {
        nextErrors.experience = "Дор хаяж нэг ажлын туршлага нэмнэ үү";
      }
    }

    if (step === 4) {
      const hasValidEducation = formData.education.some(
        (item) =>
          item.school.trim() || item.degree.trim() || item.start || item.end,
      );

      if (!hasValidEducation) {
        nextErrors.education = "Дор хаяж нэг боловсролын мэдээлэл нэмнэ үү";
      }
    }

    if (step === 5) {
      if (!Array.isArray(formData.skills) || formData.skills.length === 0) {
        nextErrors.skills = "Дор хаяж нэг ур чадвар сонгоно уу";
      }
    }

    if (step === 6) {
      if (
        !Array.isArray(formData.languages) ||
        formData.languages.length === 0
      ) {
        nextErrors.languages = "Дор хаяж нэг хэл сонгоно уу";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < lastStep) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const generatePaymentReference = (id: string): string => {
    return `CV-${id.slice(0, 6).toUpperCase()}`;
  };

  const handleGeneratePreview = async () => {
    const allValid =
      validateStep(1) &&
      validateStep(3) &&
      validateStep(4) &&
      validateStep(5) &&
      validateStep(6);

    if (!allValid) {
      alert("Шаардлагатай мэдээллээ гүйцэд бөглөнө үү.");
      return;
    }

    try {
      setLoadingPreview(true);

      const payload = {
        ...formData,
        skills: formatSkillsForSave(formData.skills),
        languages: formatLanguagesForSave(formData.languages),
        experience: formData.experience.map((item) => ({
          ...item,
          description: "",
        })),
      };

      const generateResponse = await fetch("/api/generate-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ formData: payload }),
      });

      if (!generateResponse.ok) {
        const errorText = await generateResponse.text();
        console.error("AI generate error:", errorText);
        throw new Error("AI resume generation failed");
      }

      const generated = await generateResponse.json();
      const aiData = generated.resume as ResumeData;

      setAiResumeData(aiData);

      if (resumeId) {
        const { error } = await supabase
          .from("resumes")
          .update({
            full_name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            location: formData.location,
            form_data_json: payload,
            resume_json: aiData,
          })
          .eq("id", resumeId);

        if (error) throw error;

        setPreviewReady(true);
        return;
      }

      const { data, error } = await supabase
        .from("resumes")
        .insert({
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          location: formData.location,
          form_data_json: payload,
          resume_json: aiData,
          status: "draft",
        })
        .select()
        .single();

      if (error) throw error;

      const ref = generatePaymentReference(data.id);

      setResumeId(data.id);
      setPaymentReference(ref);
      localStorage.setItem("resumeId", data.id);
      setResumeStatus(data.status || "draft");
      setPreviewReady(true);
    } catch (error) {
      console.error("Preview save error:", error);
      alert("AI CV үүсгэх үед алдаа гарлаа.");
    } finally {
      setLoadingPreview(false);
    }
  };

  const handlePaymentSubmitted = async () => {
    if (!resumeId) {
      alert("Эхлээд CV үүсгэнэ үү.");
      return;
    }

    try {
      setSubmittingPayment(true);

      const reference = paymentReference || generatePaymentReference(resumeId);

      const { error: paymentError } = await supabase.from("payments").insert({
        resume_id: resumeId,
        payer_name: formData.fullName,
        bank_note: "Golomt Bank / Odmunkh / 1105408296",
        transaction_note: reference,
        status: "pending",
      });

      if (paymentError) throw paymentError;

      const { error: resumeError } = await supabase
        .from("resumes")
        .update({
          status: "pending_payment",
        })
        .eq("id", resumeId);

      if (resumeError) throw resumeError;

      try {
        await fetch("/api/payment-notify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: formData.fullName,
            email: formData.email,
            resumeId,
            paymentReference: reference,
          }),
        });
      } catch (notifyError) {
        console.error("Payment notify error:", notifyError);
      }

      setPaymentReference(reference);
      setResumeStatus("pending_payment");
      setPaymentSubmitted(true);
    } catch (error) {
      console.error("Payment submit error:", error);
      alert("Төлбөрийн хүсэлт илгээх үед алдаа гарлаа.");
    } finally {
      setSubmittingPayment(false);
    }
  };

  const checkResumeStatus = async () => {
    if (!resumeId) return;

    try {
      setCheckingStatus(true);

      const { data, error } = await supabase
        .from("resumes")
        .select("status")
        .eq("id", resumeId)
        .single();

      if (error) throw error;

      setResumeStatus(data.status);

      if (data.status === "pending_payment") {
        setPaymentSubmitted(true);
      }

      if (data.status === "approved") {
        setPaymentSubmitted(true);
        setPreviewReady(true);
      }
    } catch (error) {
      console.error("Status check error:", error);
      alert("Төлөв шалгах үед алдаа гарлаа.");
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!previewRef.current) {
      alert("Preview олдсонгүй.");
      return;
    }

    let wrapper: HTMLDivElement | null = null;

    try {
      setDownloadingPdf(true);

      const clonedNode = previewRef.current.cloneNode(true) as HTMLDivElement;

      clonedNode.style.background = "#ffffff";
      clonedNode.style.color = "#111827";
      clonedNode.style.width = `${previewRef.current.offsetWidth}px`;
      clonedNode.style.padding = "0";
      clonedNode.style.margin = "0";
      clonedNode.style.boxSizing = "border-box";

      wrapper = document.createElement("div");
      wrapper.style.position = "fixed";
      wrapper.style.left = "-100000px";
      wrapper.style.top = "0";
      wrapper.style.width = `${previewRef.current.offsetWidth}px`;
      wrapper.style.background = "#ffffff";
      wrapper.style.zIndex = "-1";
      wrapper.style.padding = "0";
      wrapper.style.margin = "0";
      wrapper.style.boxSizing = "border-box";

      wrapper.appendChild(clonedNode);
      document.body.appendChild(wrapper);

      sanitizeColors(wrapper);

      const canvas = await html2canvas(clonedNode, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        scrollX: 0,
        scrollY: 0,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = 210;
      const pageHeight = 297;
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = (
        aiResumeData?.fullName ||
        formData.fullName ||
        "resume"
      ).replace(/\s+/g, "_");

      pdf.save(`${fileName}.pdf`);
    } catch (error) {
      console.error("PDF download error:", error);
      alert("PDF татах үед алдаа гарлаа.");
    } finally {
      if (wrapper && document.body.contains(wrapper)) {
        document.body.removeChild(wrapper);
      }
      setDownloadingPdf(false);
    }
  };

  const copyText = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopySuccess(`${label} хуулагдлаа`);
      setTimeout(() => setCopySuccess(""), 2000);
    } catch (error) {
      console.error("Copy error:", error);
      alert("Хуулах үед алдаа гарлаа.");
    }
  };

  const copyAllPaymentInfo = async () => {
    const reference =
      paymentReference ||
      (resumeId ? generatePaymentReference(resumeId) : "CV-XXXXXX");

    const fullText = [
      "CV үүсгэх үнэ: 4900₮",
      "Банк: Golomt Bank",
      "Дансны нэр: Odmunkh",
      "Дансны дугаар: 1105408296",
      `Гүйлгээний утга: ${reference}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(fullText);
      setCopySuccess("Төлбөрийн мэдээлэл бүгд хуулагдлаа");
      setTimeout(() => setCopySuccess(""), 2000);
    } catch (error) {
      console.error("Copy all error:", error);
      alert("Хуулах үед алдаа гарлаа.");
    }
  };

  const clearCurrentResume = () => {
    localStorage.removeItem("resumeId");
    setResumeId(null);
    setPaymentReference("");
    setResumeStatus("draft");
    setPaymentSubmitted(false);
    setPreviewReady(false);
    setCurrentStep(1);
    setAiResumeData(null);
    setErrors({});
    setFormData(normalizeInitialData(initialFormData));
  };

  const previewData: ResumeData = {
    ...(aiResumeData || formData),
    skills: formatSkillsForSave(formData.skills),
    languages: formatLanguagesForSave(formData.languages),
  };

  const finalReference =
    paymentReference ||
    (resumeId ? generatePaymentReference(resumeId) : "CV-XXXXXX");

  const stepContent = useMemo(() => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            className="grid gap-4 md:grid-cols-2"
          >
            <Input
              label="Овог нэр"
              value={formData.fullName}
              onChange={(v) => updateField("fullName", v)}
              placeholder="Жишээ: Бат-Эрдэнэ Дөлгөөн"
              error={errors.fullName}
            />
            <Input
              label="Имэйл"
              type="email"
              inputMode="email"
              value={formData.email}
              onChange={(v) => updateField("email", v.trim())}
              placeholder="name@email.com"
              error={errors.email}
            />
            <Input
              label="Утас"
              type="tel"
              inputMode="numeric"
              value={formData.phone}
              onChange={(v) => updateField("phone", sanitizePhone(v))}
              placeholder="99112233 эсвэл +97699112233"
              error={errors.phone}
            />
            <Input
              label="Байршил"
              value={formData.location}
              onChange={(v) => updateField("location", v)}
              placeholder="Улаанбаатар"
              error={errors.location}
            />
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
          >
            <Textarea
              label="Товч танилцуулга"
              value={formData.summary}
              onChange={(v) => updateField("summary", v)}
              placeholder="Хоосон үлдээж болно. AI таны мэдээллээр өөрөө боловсруулна."
              rows={3}
            />
            <p className="mt-2 text-xs text-gray-500">
              Энэ хэсэг заавал биш. Аль болох бага бичүүлнэ.
            </p>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            className="space-y-4"
          >
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  Ажлын туршлага
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Нэг мөрөөр оруулна. Нэмэх дархад доороосоо нэмэгдэнэ.
                </p>
              </div>

              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {formData.experience.map((item, index) => (
                    <motion.div
                      key={`exp-${index}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="grid gap-3 rounded-2xl border border-gray-200 bg-white p-3 md:grid-cols-5"
                    >
                      <Input
                        label="Компани"
                        value={item.company}
                        onChange={(v) => updateExperience(index, "company", v)}
                        placeholder="Жишээ: Unitel"
                        compact
                      />
                      <Input
                        label="Албан тушаал"
                        value={item.role}
                        onChange={(v) => updateExperience(index, "role", v)}
                        placeholder="Frontend Developer"
                        compact
                      />
                      <Input
                        label="Эхэлсэн"
                        type="month"
                        value={item.start}
                        onChange={(v) => updateExperience(index, "start", v)}
                        compact
                      />
                      <Input
                        label="Дууссан"
                        type="month"
                        value={item.end}
                        onChange={(v) => updateExperience(index, "end", v)}
                        compact
                      />
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeExperience(index)}
                          className="h-11 w-full rounded-xl border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50"
                        >
                          ×
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {errors.experience ? (
                <p className="mt-3 text-sm text-red-500">{errors.experience}</p>
              ) : null}

              <button
                type="button"
                onClick={addExperience}
                className="mt-4 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-100"
              >
                + Туршлага нэмэх
              </button>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            className="space-y-4"
          >
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  Боловсрол
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Нэг мөрөөр оруулна. Хэт олон талбаргүй.
                </p>
              </div>

              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {formData.education.map((item, index) => (
                    <motion.div
                      key={`edu-${index}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="grid gap-3 rounded-2xl border border-gray-200 bg-white p-3 md:grid-cols-5"
                    >
                      <Input
                        label="Сургууль"
                        value={item.school}
                        onChange={(v) => updateEducation(index, "school", v)}
                        placeholder="Жишээ: MUST"
                        compact
                      />
                      <Input
                        label="Зэрэг / Мэргэжил"
                        value={item.degree}
                        onChange={(v) => updateEducation(index, "degree", v)}
                        placeholder="Software Engineering"
                        compact
                      />
                      <Input
                        label="Эхэлсэн"
                        type="month"
                        value={item.start}
                        onChange={(v) => updateEducation(index, "start", v)}
                        compact
                      />
                      <Input
                        label="Дууссан"
                        type="month"
                        value={item.end}
                        onChange={(v) => updateEducation(index, "end", v)}
                        compact
                      />
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeEducation(index)}
                          className="h-11 w-full rounded-xl border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50"
                        >
                          ×
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {errors.education ? (
                <p className="mt-3 text-sm text-red-500">{errors.education}</p>
              ) : null}

              <button
                type="button"
                onClick={addEducation}
                className="mt-4 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-100"
              >
                + Боловсрол нэмэх
              </button>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            key="step-5"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
          >
            <ChipSelector
              label="Ур чадвар"
              value={formData.skills}
              onChange={(v) => updateField("skills", v)}
              options={DEFAULT_SKILLS}
              placeholder="Өөр ур чадвар оруулах"
              error={errors.skills}
            />
          </motion.div>
        );

      case 6:
        return (
          <motion.div
            key="step-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            className="space-y-4"
          >
            <LanguageSelector
              label="Хэл"
              value={formData.languages}
              onChange={(v) => updateField("languages", v)}
              error={errors.languages}
            />
          </motion.div>
        );

      case 7:
        return (
          <motion.div
            key="step-7"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            className="space-y-6"
          >
            {!previewReady ? (
              <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                <motion.div
                  initial={{ scale: 0.96, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-xl text-white shadow-lg">
                    AI
                  </div>

                  <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                    AI-аар CV үүсгэнэ
                  </h2>
                  <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-600">
                    Таны оруулсан товч мэдээллээр AI илүү цэвэр, уншихад амархан
                    CV preview үүсгэнэ.
                  </p>

                  <button
                    type="button"
                    onClick={handleGeneratePreview}
                    disabled={loadingPreview}
                    className="mt-6 rounded-2xl bg-black px-6 py-3 text-sm font-semibold text-white shadow-md hover:opacity-90 disabled:opacity-60"
                  >
                    {loadingPreview ? "AI боловсруулж байна..." : "CV үүсгэх"}
                  </button>
                </motion.div>
              </div>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
                >
                  <div
                    ref={previewRef}
                    className="pdf-safe-preview"
                    style={{ backgroundColor: "#ffffff" }}
                  >
                    <ResumePreview data={previewData} />
                  </div>
                </motion.div>

                <div className="mx-auto w-full max-w-3xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Төлбөр төлөх
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
                        CV үүсгэх үнэ:{" "}
                        <span className="font-semibold text-gray-900">
                          4900₮
                        </span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={copyAllPaymentInfo}
                      className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                    >
                      Бүгдийг хуулах
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    <CopyRow
                      label="Банк"
                      value="Golomt Bank"
                      onCopy={() => copyText("Golomt Bank", "Банк")}
                    />
                    <CopyRow
                      label="Дансны нэр"
                      value="Odmunkh"
                      onCopy={() => copyText("Odmunkh", "Дансны нэр")}
                    />
                    <CopyRow
                      label="Дансны дугаар"
                      value="1105408296"
                      onCopy={() => copyText("1105408296", "Дансны дугаар")}
                    />
                    <CopyRow
                      label="Гүйлгээний утга"
                      value={finalReference}
                      onCopy={() => copyText(finalReference, "Гүйлгээний утга")}
                    />
                  </div>

                  <AnimatePresence>
                    {copySuccess ? (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-700"
                      >
                        {copySuccess}
                      </motion.div>
                    ) : null}
                  </AnimatePresence>

                  <div className="mt-4 rounded-2xl bg-blue-50 p-4 text-sm text-blue-800">
                    Төлбөр хийхдээ{" "}
                    <span className="font-semibold">гүйлгээний утга</span>-д яг
                    энэ кодыг бичээрэй:{" "}
                    <span className="font-bold">{finalReference}</span>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handlePaymentSubmitted}
                      disabled={paymentSubmitted || submittingPayment}
                      className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submittingPayment
                        ? "Илгээж байна..."
                        : paymentSubmitted
                          ? "Төлбөр шалгаж байна"
                          : "Төлбөр төлсөн"}
                    </button>

                    {paymentSubmitted && resumeStatus !== "approved" ? (
                      <button
                        type="button"
                        onClick={checkResumeStatus}
                        disabled={checkingStatus}
                        className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 disabled:opacity-60"
                      >
                        {checkingStatus
                          ? "Шалгаж байна..."
                          : "Төлбөр шалгуулах"}
                      </button>
                    ) : null}

                    {resumeStatus === "approved" ? (
                      <button
                        type="button"
                        onClick={handleDownloadPdf}
                        disabled={downloadingPdf}
                        className="rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                      >
                        {downloadingPdf ? "PDF бэлдэж байна..." : "PDF татах"}
                      </button>
                    ) : null}

                    <button
                      type="button"
                      onClick={clearCurrentResume}
                      className="rounded-xl border border-red-300 px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      Шинээр эхлэх
                    </button>
                  </div>

                  {paymentSubmitted && resumeStatus !== "approved" ? (
                    <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                      Таны хүсэлтийг хүлээн авлаа. Төлбөр шалгасны дараа PDF
                      татах боломж нээгдэнэ.
                    </div>
                  ) : null}

                  {resumeStatus === "approved" ? (
                    <div className="mt-4 rounded-xl bg-green-50 p-4 text-sm text-green-800">
                      Төлбөр баталгаажсан байна. Та одоо PDF татах боломжтой.
                    </div>
                  ) : null}

                  {resumeId ? (
                    <p className="mt-4 text-xs text-gray-400">
                      Resume ID: {resumeId}
                    </p>
                  ) : null}
                </div>
              </>
            )}
          </motion.div>
        );

      default:
        return null;
    }
  }, [
    currentStep,
    formData,
    previewReady,
    paymentSubmitted,
    loadingPreview,
    submittingPayment,
    checkingStatus,
    resumeStatus,
    downloadingPdf,
    resumeId,
    aiResumeData,
    paymentReference,
    copySuccess,
    errors,
    finalReference,
  ]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-gray-50 px-2  py-4 md:px-6">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mb-8 flex items-center justify-center"
        >
          <div className="text-2xl font-bold tracking-tight text-gray-900 "></div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="mx-auto max-w-4xl rounded-3xl border border-gray-200 bg-white p-5 shadow-sm md:p-8"
        >
          <StepCircleStepper
            steps={steps}
            currentStep={currentStep}
            onStepClick={setCurrentStep}
          />

          <div className="mt-8">
            <AnimatePresence mode="wait">{stepContent}</AnimatePresence>
          </div>

          {!isReviewStep ? (
            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="rounded-2xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Back
              </button>

              <button
                type="button"
                onClick={nextStep}
                className="rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90"
              >
                Next
              </button>
            </div>
          ) : (
            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="rounded-2xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
              >
                Back
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}

function CopyRow({ label, value, onCopy }: CopyRowProps) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-gray-200 p-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {label}
        </p>
        <p className="mt-1 break-all text-sm font-semibold text-gray-900">
          {value}
        </p>
      </div>

      <button
        type="button"
        onClick={onCopy}
        className="rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
      >
        Хуулах
      </button>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  error,
  type = "text",
  inputMode,
  compact = false,
}: InputProps) {
  return (
    <label className="block">
      <span
        className={`mb-2 block font-medium text-gray-700 ${
          compact ? "text-xs" : "text-sm"
        }`}
      >
        {label}
      </span>
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className={`w-full rounded-2xl border bg-white outline-none transition focus:border-black ${
          compact ? "px-3 py-2.5 text-sm" : "px-4 py-3 text-sm"
        } ${error ? "border-red-300" : "border-gray-300"}`}
      />
      {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: TextareaProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
      />
    </label>
  );
}

function ChipSelector({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
}: ChipSelectorProps) {
  const [customValue, setCustomValue] = useState<string>("");

  const toggle = (item: string) => {
    if (value.includes(item)) {
      onChange(value.filter((v) => v !== item));
    } else {
      onChange([...value, item]);
    }
  };

  const addCustom = () => {
    const cleaned = customValue.trim();
    if (!cleaned) return;
    if (!value.includes(cleaned)) {
      onChange([...value, cleaned]);
    }
    setCustomValue("");
  };

  const removeChip = (item: string) => {
    onChange(value.filter((v) => v !== item));
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-gray-900">{label}</h3>
        <p className="mt-1 text-xs text-gray-500">
          Сонгоод нэмнэ. Хүсвэл өөрөө бас нэмж болно.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {options.map((item) => {
          const active = value.includes(item);
          return (
            <button
              key={item}
              type="button"
              onClick={() => toggle(item)}
              className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-black text-white"
                  : "border border-gray-300 bg-white text-gray-800 hover:bg-gray-100"
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
        />
        <button
          type="button"
          onClick={addCustom}
          className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100"
        >
          Нэмэх
        </button>
      </div>

      {value.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {value.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-2 rounded-full bg-black px-3 py-2 text-sm text-white"
            >
              {item}
              <button
                type="button"
                onClick={() => removeChip(item)}
                className="text-white opacity-80 hover:opacity-100"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : null}

      {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
    </div>
  );
}

function LanguageSelector({
  label,
  value,
  onChange,
  error,
}: LanguageSelectorProps) {
  const [language, setLanguage] = useState<string>(DEFAULT_LANGUAGES[0]);
  const [level, setLevel] = useState<string>(LANGUAGE_LEVELS[0]);

  const addLanguage = () => {
    const item = `${language} – ${level}`;
    if (!value.includes(item)) {
      onChange([...value, item]);
    }
  };

  const removeLanguage = (item: string) => {
    onChange(value.filter((v) => v !== item));
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-gray-900">{label}</h3>
        <p className="mt-1 text-xs text-gray-500">
          Хэл болон түвшнээ сонгоод нэмнэ.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Select
          label="Хэл"
          value={language}
          onChange={setLanguage}
          options={DEFAULT_LANGUAGES}
        />
        <Select
          label="Түвшин"
          value={level}
          onChange={setLevel}
          options={LANGUAGE_LEVELS}
        />
        <div className="flex items-end">
          <button
            type="button"
            onClick={addLanguage}
            className="h-11 w-full rounded-2xl border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-900 hover:bg-gray-100"
          >
            Нэмэх
          </button>
        </div>
      </div>

      {value.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {value.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-2 rounded-full bg-black px-3 py-2 text-sm text-white"
            >
              {item}
              <button
                type="button"
                onClick={() => removeLanguage(item)}
                className="text-white opacity-80 hover:opacity-100"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : null}

      {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
    </div>
  );
}

function Select({ label, value, onChange, options }: SelectProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-gray-700">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-2xl border border-gray-300 bg-white px-4 text-sm outline-none transition focus:border-black"
      >
        {options.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </label>
  );
}
