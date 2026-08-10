import { useMemo } from "react";
import { WalkthroughSteps, useWalkthroughStep } from "../pages/EasyImport/useWalkthroughStep";

interface Step {
  key: string;
  label: string;
  description: string;
}
const STEPS: Step[] = [
  {key: WalkthroughSteps.Sync, label: 'Sync', description: "Fetching your Spotify library - this can take a while for large libraries."},
  {key: WalkthroughSteps.Select, label: 'Select', description: "Choose what you'd like to bring over below, then hit Import."},
  {key: WalkthroughSteps.Importing, label: 'Import', description: "Matching your Spotify library on Tidal and importing - this can take a while for large libraries."},
  {key: WalkthroughSteps.Done, label: 'Done', description: "All done! Check below for anything that couldn't be matched."},
];

const PAUSED_DESCRIPTION = "Your last import didn't finish - click Import below to pick up where you left off.";

export const Walkthrough = () => {
  const step = useWalkthroughStep();
  const isPaused = step === WalkthroughSteps.Paused;
  // A paused import is still visually "at" the Import step, just not actively running
  const currentIndex = STEPS.findIndex(s => s.key === (isPaused ? WalkthroughSteps.Importing : step));

  return <div className="flex flex-col gap-2 min-w-0">
    <div className="flex items-center justify-center min-w-0 overflow-x-auto -mx-8 sm:mx-0">
      {STEPS.map((s, i) => <WalkthroughStep
        key={s.key}
        step={s}
        index={i}
        currentIndex={currentIndex}
        isPaused={isPaused}
      />)}
    </div>
    <p className="text-sm text-gray-400">{isPaused ? PAUSED_DESCRIPTION : STEPS[currentIndex].description}</p>
  </div>;
};

interface WalkthroughStepProps {
  step: Step;
  index: number;
  currentIndex: number;
  isPaused: boolean;
}
const WalkthroughStep = ({ step, index, currentIndex, isPaused }: WalkthroughStepProps) => {
  const isCurrent = index === currentIndex;
  const showPaused = isCurrent && isPaused;

  const labelTextColor = useMemo(() => {
    if (!isCurrent) return "text-gray-500";
    if (showPaused) return "text-amber-200";
    return "text-purple-100";
  }, [isCurrent, showPaused]);

  const stepNumberStyle = useMemo(() => {
    if (showPaused) return "border-amber-300 text-amber-200";
    if (index < currentIndex) return "bg-purple-400 text-black";
    if (isCurrent) return "border-purple-400 text-purple-300";
    return "border-white/20 text-gray-500";
  }, [currentIndex, index, isCurrent, showPaused]);

  return <div className="flex items-center min-w-0">
    <div className={`flex items-center justify-center w-6 h-6 rounded-full shrink-0 text-xs transition-colors duration-300 border-2 ${stepNumberStyle}`}>
      {showPaused ? "⏸" : index + 1}
    </div>
    <span className={`ml-1 sm:ml-2 text-xs sm:text-sm ${labelTextColor}`}>{step.label}</span>
    {index < STEPS.length - 1 && <div className="flex-1 min-w-2 sm:min-w-4 h-px mx-1 sm:mx-2 bg-white/20" />}
  </div>;
}