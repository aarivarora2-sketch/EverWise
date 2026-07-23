import { useState } from "react";
import BlockShell from "./BlockShell";
import { MultipleChoiceBody } from "./ScenarioBlock";

export default function ChoiceBlock({
  block,
  progress,
  progressTotal,
  onContinue,
  onBack,
}) {
  const [selected, setSelected] = useState(null);

  return (
    <BlockShell
      label={block.title || "Choose"}
      progress={progress}
      progressTotal={progressTotal}
      onBack={onBack}
      footer={
        selected != null ? (
          <button className="btn-primary" onClick={onContinue}>
            Continue
          </button>
        ) : null
      }
    >
      <MultipleChoiceBody
        title={block.title}
        text={block.text}
        options={block.options}
        correctIndex={block.correctIndex}
        explanation={block.explanation}
        selected={selected}
        onSelect={setSelected}
      />
    </BlockShell>
  );
}
