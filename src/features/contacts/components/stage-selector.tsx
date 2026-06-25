import type { Stage } from "@prisma/client";

import { STAGE_CONFIG, STAGE_ORDER } from "../constants";

interface StageSelectorProps {
  currentStage: Stage;
  onStageChange: (stage: Stage) => void;
  isPending: boolean;
}

export function StageSelector({ currentStage, onStageChange, isPending }: StageSelectorProps) {
  return (
    <div
      className="px-5 py-3 flex items-center gap-3"
      style={{ borderBottom: "1px solid var(--color-edge)" }}
    >
      <span className="text-sm font-medium" style={{ color: "var(--color-muted)" }}>
        Stage:
      </span>
      <div className="flex gap-1">
        {STAGE_ORDER.map((stage) => {
          const config = STAGE_CONFIG[stage];
          const isActive = currentStage === stage;
          return (
            <button
              key={stage}
              onClick={() => onStageChange(stage)}
              disabled={isPending}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: isActive ? config.bg : "var(--color-void)",
                color: isActive ? config.color : "var(--color-muted)",
                border: isActive ? `1px solid ${config.color}30` : "1px solid var(--color-edge)",
              }}
            >
              {config.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
