import { useState, useCallback, useEffect } from 'react';
import JungleBackground from './components/JungleBackground';
import ProgressTracker from './components/ProgressTracker';
import MonkeyMascot from './components/MonkeyMascot';
import SentenceDisplay from './components/SentenceDisplay';
import RecordButton from './components/RecordButton';
import ScoreDisplay from './components/ScoreDisplay';
import ActionButtons from './components/ActionButtons';
import Confetti from './components/Confetti';
import ToastContainer, { showToast } from './components/Toast';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import {
  fetchRandomSentence,
  evaluateAudio,
  type WordResult,
  type Sentence,
} from './services/api';

type AppState = 'idle' | 'recording' | 'processing' | 'success' | 'tryAgain';

function App() {
  const [sentence, setSentence] = useState<Sentence | null>(null);
  const [appState, setAppState] = useState<AppState>('idle');
  const [comparison, setComparison] = useState<WordResult[] | null>(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Session stats
  const [attempts, setAttempts] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const { isRecording, startRecording, stopRecording, error: micError, analyserNode } =
    useAudioRecorder();

  // Show mic error as toast
  useEffect(() => {
    if (micError) showToast(micError, 'error');
  }, [micError]);

  // Load a sentence on mount
  const loadSentence = useCallback(async () => {
    try {
      setLoading(true);
      setComparison(null);
      setAppState('idle');
      const data = await fetchRandomSentence();
      setSentence(data);
    } catch {
      showToast('Could not load a sentence. Is the backend running?', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSentence();
  }, [loadSentence]);

  // Start recording
  const handleStartRecording = async () => {
    setComparison(null);
    await startRecording();
    setAppState('recording');
  };

  // Stop recording and send to backend for evaluation
  const handleStopRecording = async () => {
    setAppState('processing');
    try {
      const blob = await stopRecording();

      if (!sentence) return;

      const result = await evaluateAudio(blob, sentence.id);

      setComparison(result.comparison);
      setScore(result.score);
      setCorrectCount(result.correct_count);
      setTotalCount(result.total_count);
      setAttempts((a) => a + 1);

      if (result.score > bestScore) setBestScore(result.score);

      if (result.score >= 80) {
        setAppState('success');
        setCurrentStreak((s) => s + 1);
        setShowConfetti(true);
        showToast(
          result.score === 100 ? 'PERFECT score! You\'re a superstar!' : 'Great job! Keep it up!',
          'success'
        );
        setTimeout(() => setShowConfetti(false), 3500);
      } else {
        setAppState('tryAgain');
        setCurrentStreak(0);
        showToast('Tap the red words to hear them spoken! 🔊', 'info');
      }
    } catch {
      showToast('Something went wrong. Please try again!', 'error');
      setAppState('idle');
    }
  };

  // TTS: speak a word using browser SpeechSynthesis
  const speakWord = (word: string) => {
    const stripped = word.replace(/[^a-zA-Z'-]/g, '');
    const utterance = new SpeechSynthesisUtterance(stripped);
    utterance.lang = 'en-US';
    utterance.rate = 0.75;
    utterance.pitch = 1.1;
    speechSynthesis.speak(utterance);
  };

  // Try the same sentence again
  const handleTryAgain = () => {
    setComparison(null);
    setAppState('idle');
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      {/* ── Immersive animated background ── */}
      <JungleBackground />

      {/* ── Confetti overlay ── */}
      <Confetti active={showConfetti} />

      {/* ── Toast notifications ── */}
      <ToastContainer />

      {/* ── Main dashboard grid ── */}
      <div className="relative z-10 h-full w-full p-3 md:p-4 lg:p-5">
        <div className="h-full grid grid-cols-1 lg:grid-cols-[220px_1fr] xl:grid-cols-[260px_1fr] gap-3 md:gap-4">

          {/* ── LEFT SIDEBAR (hidden on mobile, shown on lg+) ── */}
          <aside className="hidden lg:block">
            <ProgressTracker
              attempts={attempts}
              bestScore={bestScore}
              currentStreak={currentStreak}
              state={appState}
            />
          </aside>

          {/* ── MAIN CONTENT AREA ── */}
          <main className="flex flex-col gap-3 md:gap-4 min-h-0 overflow-y-auto custom-scrollbar">

            {/* ── Top bar (mobile: logo + stats inline) ── */}
            <div className="lg:hidden flex items-center gap-3">
              <div className="card-brutal bg-gradient-to-r from-monkey-orange to-banana-yellow px-4 py-2 flex items-center gap-2">
                <span className="text-2xl">🐵</span>
                <span className="text-base font-extrabold font-[Fredoka] text-gray-900">Talkie Monkey</span>
              </div>
              <div className="flex gap-2 ml-auto">
                {[
                  { icon: '🎯', val: attempts },
                  { icon: '🏆', val: `${bestScore}%` },
                  { icon: '🔥', val: currentStreak },
                ].map((s) => (
                  <div key={s.icon} className="card-brutal-sm px-2.5 py-1.5 flex items-center gap-1.5">
                    <span className="text-sm">{s.icon}</span>
                    <span className="text-sm font-extrabold font-[Fredoka]">{s.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Bento Grid: Monkey + Sentence + RecordButton ── */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 md:gap-4 flex-1 min-h-0">

              {/* ─ Left: Sentence + Score + Actions ─ */}
              <div className="flex flex-col gap-3 md:gap-4 min-h-0">

                {/* Sentence Card */}
                {loading ? (
                  <div className="card-brutal bg-white p-8 flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-5xl animate-float-gentle mb-3">🐵</div>
                      <p className="text-lg font-bold text-gray-400 font-[Fredoka]">
                        Loading a sentence...
                      </p>
                    </div>
                  </div>
                ) : sentence ? (
                  <SentenceDisplay
                    sentence={sentence.content}
                    comparison={comparison}
                    onWordClick={speakWord}
                  />
                ) : null}

                {/* Score (when available) */}
                {comparison && (
                  <ScoreDisplay
                    score={score}
                    correctCount={correctCount}
                    totalCount={totalCount}
                  />
                )}

                {/* Action buttons (when results) */}
                <ActionButtons
                  hasResults={comparison !== null}
                  onTryAgain={handleTryAgain}
                  onNextSentence={loadSentence}
                />
              </div>

              {/* ─ Right: Mascot + Record Button column ─ */}
              <div className="flex flex-col items-center justify-center gap-4 md:gap-6 md:w-56 lg:w-64">
                {/* Mascot */}
                <MonkeyMascot state={appState} />

                {/* Record Button */}
                {sentence && !loading && appState !== 'success' && appState !== 'tryAgain' && (
                  <RecordButton
                    isRecording={isRecording}
                    isProcessing={appState === 'processing'}
                    onStart={handleStartRecording}
                    onStop={handleStopRecording}
                    analyserNode={analyserNode}
                  />
                )}

                {/* Hint text when results shown */}
                {(appState === 'success' || appState === 'tryAgain') && (
                  <div className="text-center animate-float-in">
                    <p className="text-sm font-bold text-white/70 font-[Fredoka] drop-shadow">
                      {appState === 'success'
                        ? '🎉 Try the next one!'
                        : '👆 Tap red words, then try again!'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Bottom decorative strip ── */}
            <div className="flex items-center justify-center gap-2 py-1 opacity-50">
              <span className="text-xs font-bold text-white/60 font-[Fredoka]">
                🐵 Talkie Monkey — Made for young learners
              </span>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
