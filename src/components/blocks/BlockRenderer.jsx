import LearnBlock from "./LearnBlock";
import MultiselectBlock from "./MultiselectBlock";
import FlashcardsBlock from "./FlashcardsBlock";
import MatchBlock from "./MatchBlock";
import FillBlankBlock from "./FillBlankBlock";
import ScenarioBlock from "./ScenarioBlock";
import TrueFalseBlock from "./TrueFalseBlock";
import ChoiceBlock from "./ChoiceBlock";
import BuilderBlock from "./BuilderBlock";
import VideoBlock from "./VideoBlock";
import ReadingBlock from "./ReadingBlock";
import TieredChoiceBlock from "./TieredChoiceBlock";
import ConfidenceBlock from "./ConfidenceBlock";
import MemoryBlock from "./MemoryBlock";
import FinalBossBlock from "./FinalBossBlock";

const BLOCKS = {
  // Scam-protection lesson format
  reading: ReadingBlock,
  tiered: TieredChoiceBlock,
  confidence: ConfidenceBlock,
  memory: MemoryBlock,
  finalboss: FinalBossBlock,
  // Digital-literacy lesson format
  video: VideoBlock,
  learn: LearnBlock,
  multiselect: MultiselectBlock,
  flashcards: FlashcardsBlock,
  match: MatchBlock,
  fillblank: FillBlankBlock,
  scenario: ScenarioBlock,
  truefalse: TrueFalseBlock,
  choice: ChoiceBlock,
  builder: BuilderBlock,
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
