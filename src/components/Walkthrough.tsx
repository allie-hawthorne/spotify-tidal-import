import { WalkthroughStep, useWalkthroughStep } from "../pages/EasyImport/useWalkthroughStep";

const STEPS: {key: string, label: string, description: string}[] = [
  {key: WalkthroughStep.Sync, label: 'Sync', description: "Fetching your Spotify library - this can take a while for large libraries."},
  {key: WalkthroughStep.Select, label: 'Select', description: "Choose what you'd like to bring over below, then hit Import."},
  {key: WalkthroughStep.Importing, label: 'Import', description: "Matching your Spotify library on Tidal and importing - this can take a while for large libraries."},
  {key: WalkthroughStep.Done, label: 'Done', description: "All done! Check below for anything that couldn't be matched."},
];

const PAUSED_DESCRIPTION = "Your last import didn't finish - click Import below to pick up where you left off.";

export const Walkthrough = () => {
  const step = useWalkthroughStep();
  const isPaused = step === WalkthroughStep.Paused;
  // A paused import is still visually "at" the Import step, just not actively running
  const currentIndex = STEPS.findIndex(s => s.key === (isPaused ? WalkthroughStep.Importing : step));

  return <div className="flex flex-col gap-2">
    <div className="flex items-center">
      {STEPS.map((s, i) => {
        const isCurrent = i === currentIndex;
        const showPaused = isCurrent && isPaused;
        return <div key={s.key} className="flex items-center">
          <div className={`flex items-center justify-center w-6 h-6 rounded-full shrink-0 text-xs transition-colors duration-300 ${
            showPaused ? "border-2 border-amber-300 text-amber-200"
              : i < currentIndex ? "bg-purple-400 text-black"
              : isCurrent ? "border-2 border-purple-400 text-purple-300"
              : "border border-white/20 text-gray-500"
          }`}>{showPaused ? "⏸" : i + 1}</div>
          <span className={`ml-2 text-sm ${!isCurrent ? "text-gray-500" : showPaused ? "text-amber-200" : "text-white"}`}>{s.label}</span>
          {i < STEPS.length - 1 && <div className="w-6 h-px mx-2 bg-white/20" />}
        </div>;
      })}
    </div>
    <p className="text-sm text-gray-400">{isPaused ? PAUSED_DESCRIPTION : STEPS[currentIndex].description}</p>
  </div>;
};
