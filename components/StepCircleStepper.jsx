"use client";

import { motion } from "framer-motion";

export default function StepCircleStepper({ steps, currentStep, onStepClick }) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-4 gap-4 md:grid-cols-7 md:gap-2">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = currentStep === stepNumber;
          const isDone = currentStep > stepNumber;

          return (
            <div key={step.id} className="flex flex-col items-center">
              <motion.button
                type="button"
                onClick={() => onStepClick(stepNumber)}
                whileTap={{ scale: 0.96 }}
                animate={{ scale: isActive ? 1.06 : 1 }}
                transition={{ duration: 0.2 }}
                className={
                  "flex h-11 w-11 items-center justify-center rounded-full border text-sm font-semibold transition " +
                  (isDone
                    ? "border-black bg-black text-white shadow-md"
                    : isActive
                      ? "border-black bg-white text-black shadow-sm"
                      : "border-gray-300 bg-white text-gray-400")
                }
              >
                {isDone ? "✓" : step.id}
              </motion.button>

              <div className="mt-2 text-center text-xs leading-tight text-gray-500">
                <span
                  className={
                    isActive || isDone ? "font-medium text-gray-900" : ""
                  }
                >
                  {step.title}
                </span>
              </div>

              {index !== steps.length - 1 && (
                <div className="mt-3 hidden w-full items-center md:flex">
                  <div className="h-0.5 w-full rounded-full bg-gray-200">
                    <motion.div
                      initial={false}
                      animate={{ width: isDone ? "100%" : "0%" }}
                      transition={{ duration: 0.28 }}
                      className="h-0.5 rounded-full bg-black"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className="mt-3 text-center text-sm text-gray-600"
      >
        Алхам <span className="font-semibold text-black">{currentStep}</span> /{" "}
        <span className="font-semibold text-black">{steps.length}</span> —{" "}
        <span className="font-medium text-black">
          {steps[currentStep - 1] ? steps[currentStep - 1].title : ""}
        </span>
      </motion.div>
    </div>
  );
}
