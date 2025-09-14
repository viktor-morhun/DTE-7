"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Screen from "@/components/Screen";
import OptionButton from "@/components/OptionButton";
import { completeDiscoverMakeTrainAvailable } from "@/lib/planProgress";

type Focus = "control" | "focus" | "composure";
type Helper =
  | "breakthrough"
  | "goals-progress"
  | "focused"
  | "habits"
  | "lead-improve";

const focusLabels: Record<Focus, string> = {
  control: "Control",
  focus: "Focus",
  composure: "Composure",
};

const helperLabels: Record<Helper, string> = {
  "breakthrough": "I’m coming off a breakthrough",
  "goals-progress": "I’m clear on my goals and making progress.",
  focused: "I’m focused and determined.",
  habits: "I’m building habits that work for me.",
  "lead-improve": "I’m pushing myself to lead or improve.",
};

const progressByStep: Record<1 | 2 | 3, number> = { 1: 25, 2: 65, 3: 100 };

const incStep = (s: 1 | 2 | 3): 1 | 2 | 3 => (s === 1 ? 2 : s === 2 ? 3 : 3);
const decStep = (s: 1 | 2 | 3): 1 | 2 | 3 => (s === 3 ? 2 : s === 2 ? 1 : 1);

export default function DiscoverPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [focus, setFocus] = useState<Focus | null>(null);
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5 | null>(null);

  const [flashIdx, setFlashIdx] = useState<number | null>(null);
  const flashThen = (i: number, fn: () => void) => {
    setFlashIdx(i);
    setTimeout(() => {
      setFlashIdx(null);
      fn();
    }, 120);
  };

  const next = () => setStep((s) => incStep(s));
  const prev = () => setStep((s) => decStep(s));

  if (step === 1) {
    return (
      <Screen progress={progressByStep[1]} onBack={prev}>
        <div className='mb-8 font-medium text-xl'>
          What do you want to focus on today?
        </div>
        <div className='space-y-3'>
          {(Object.keys(focusLabels) as Array<keyof typeof focusLabels>).map(
            (key, i) => (
              <OptionButton
                key={key}
                align='center'
                selected={flashIdx === i}
                onClick={() =>
                  flashThen(i, () => {
                    setFocus(key as Focus);
                    next();
                  })
                }
              >
                {focusLabels[key]}
              </OptionButton>
            )
          )}
        </div>
      </Screen>
    );
  }

  if (step === 2) {
    const currentFocusLabel = focus ? focusLabels[focus] : "Control";
    return (
      <Screen progress={progressByStep[2]} onBack={prev}>
        <div className='mb-8 font-medium text-xl'>
          How are you feeling about your {currentFocusLabel} today? (for the
          purpose of this demo, select something 4 or higher)
        </div>

        <div className='space-y-3'>
          {[5, 4, 3, 2, 1].map((rank, i) => (
            <OptionButton
              key={rank}
              leading={rank}
              selected={flashIdx === i || rank === 5}
              onClick={() => {
                if (rank >= 4) {
                  flashThen(i, () => {
                    setRating(rank as 1 | 2 | 3 | 4 | 5);
                    next();
                  });
                }
              }}
            >
              {rank === 5 &&
                "I’ve been dialed in and mentally sharp."}
              {rank === 4 &&
                "I’m mostly able to stay focused when I need to."}
              {rank === 3 && "My focus is okay, but not consistent."}
              {rank === 2 && "I get distracted or lose concentration a lot."}
              {rank === 1 && "My mind is all over the place lately."}
            </OptionButton>
          ))}
        </div>
      </Screen>
    );
  }

  // step === 3
  return (
    <Screen progress={progressByStep[3]} onBack={prev}>
      <div className='mb-5 text-lg'>
        What’s been helping you stay strong in your{" "}
        {focus ? focusLabels[focus] : "Control"}? (for the purpose of this demo, select habits)
      </div>

      <div className='space-y-3'>
        {(Object.keys(helperLabels) as Array<keyof typeof helperLabels>).map(
          (key, i) => {
            const isAllowed = key === "breakthrough";
            return (
              <OptionButton
                key={key}
                align='left'
                selected={flashIdx === i || key === "breakthrough"}
                disabled={!isAllowed}
                onClick={() =>
                  isAllowed &&
                  flashThen(i, () => {
                    try {
                      completeDiscoverMakeTrainAvailable();
                      const stored = JSON.parse(
                        localStorage.getItem("answers") || "[]"
                      );
                      stored.push({
                        focus,
                        rating,
                        helper: key,
                        ts: Date.now(),
                      });
                      localStorage.setItem("answers", JSON.stringify(stored));
                    } catch { }

                    router.replace("/modal");
                  })
                }
              >
                {helperLabels[key]}
              </OptionButton>
            );
          }
        )}
      </div>
    </Screen>
  );
}
