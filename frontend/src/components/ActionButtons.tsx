import ShimmerButton from './ShimmerButton';

interface ActionButtonsProps {
  hasResults: boolean;
  onTryAgain: () => void;
  onNextSentence: () => void;
}

/**
 * Neo-brutalism action buttons with shimmer effects.
 */
export default function ActionButtons({
  hasResults,
  onTryAgain,
  onNextSentence,
}: ActionButtonsProps) {
  if (!hasResults) return null;

  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4 animate-float-in">
      <ShimmerButton onClick={onTryAgain} variant="secondary" size="md">
        🔄 Try Again
      </ShimmerButton>
      <ShimmerButton onClick={onNextSentence} variant="primary" size="md">
        ➡️ Next Sentence
      </ShimmerButton>
    </div>
  );
}
