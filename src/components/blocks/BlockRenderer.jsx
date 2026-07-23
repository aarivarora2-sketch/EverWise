import LearnBlock from "./LearnBlock";
import MultiselectBlock from "./MultiselectBlock";
import FlashcardsBlock from "./FlashcardsBlock";
import MatchBlock from "./MatchBlock";
import FillBlankBlock from "./FillBlankBlock";
import SortBlock from "./SortBlock";
import ScenarioBlock from "./ScenarioBlock";
import TrueFalseBlock from "./TrueFalseBlock";
import ChoiceBlock from "./ChoiceBlock";

const BLOCKS = {
  learn: LearnBlock,
  multiselect: MultiselectBlock,
  flashcards: FlashcardsBlock,
  match: MatchBlock,
  fillblank: FillBlankBlock,
  sort: SortBlock,
  scenario: ScenarioBlock,
  truefalse: TrueFalseBlock,
  choice: ChoiceBlock,
};

export default function BlockRenderer({
  block,
  progress,
  progressTotal,
  onContinue,
  onBack,
}) {
  const Component = BLOCKS[block.type];
  if (!Component) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="text-xl text-ink-soft">
          Unknown block type: {block.type}
        </p>
        <button className="btn-primary mt-6" onClick={onContinue}>
          Skip
        </button>
      </div>
    );
  }
  return (
    <Component
      block={block}
      progress={progress}
      progressTotal={progressTotal}
      onContinue={onContinue}
      onBack={onBack}
    />
  );
}
