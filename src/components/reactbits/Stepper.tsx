import { motion } from "framer-motion";
import { useState } from "react";

interface StepProps {
  children: React.ReactNode;
  isActive?: boolean;
  isCompleted?: boolean;
  stepNumber: number;
}

interface StepperProps {
  initialStep?: number;
  stepIndicatorColor?: string;
  activeStepColor?: string;
  children: React.ReactElement<StepProps>[];
  className?: string;
}

const Step = ({ children, isActive, isCompleted, stepNumber }: StepProps) => {
  return (
    <motion.div
      className="flex items-center space-x-4"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: stepNumber * 0.1 }}
    >
      {/* Step indicator */}
      <motion.div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
          isCompleted
            ? "bg-green-500 border-green-500 text-white"
            : isActive
              ? "bg-amber-500 border-amber-500 text-black"
              : "bg-transparent border-gray-400 text-gray-400"
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isCompleted ? "✓" : stepNumber}
      </motion.div>

      {/* Step content */}
      <motion.div
        className={`flex-1 transition-colors duration-300 ${
          isActive ? "text-white" : "text-gray-400"
        }`}
        animate={{
          opacity: isActive ? 1 : 0.6,
          scale: isActive ? 1.02 : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export const Stepper = ({
  initialStep = 1,
  stepIndicatorColor = "#FFD700",
  activeStepColor = "#1E3A8A",
  children,
  className = "",
}: StepperProps) => {
  const [currentStep, setCurrentStep] = useState(initialStep);

  const nextStep = () => {
    if (currentStep < children.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <motion.div
      className={`space-y-6 ${className}`}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      {/* Steps */}
      <div className="space-y-4">
        {children.map((child, index) => {
          const stepNumber = index + 1;
          return (
            <Step
              key={stepNumber}
              stepNumber={stepNumber}
              isActive={stepNumber === currentStep}
              isCompleted={stepNumber < currentStep}
            >
              {child.props.children}
            </Step>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <motion.button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Anterior
        </motion.button>

        <motion.button
          onClick={nextStep}
          disabled={currentStep === children.length}
          className="px-4 py-2 bg-amber-500 text-black rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Próximo
        </motion.button>
      </div>
    </motion.div>
  );
};

// Named export for Step component
export { Step };
