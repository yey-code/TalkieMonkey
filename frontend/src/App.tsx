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
import XpProgressBar from './components/XpProgressBar';
import TranscriptionDisplay from './components/TranscriptionDisplay';
import DifficultySelector from './components/DifficultySelector';
import BottomNav, { type TabId } from './components/BottomNav';
import LevelUpModal from './components/LevelUpModal';
import RewardsPage from './components/RewardsPage';
import ParentDashboard from './components/ParentDashboard';
import ProfilePage from './components/ProfilePage';
import AiFeedbackCard from './components/AiFeedbackCard';
import PronunciationTipModal from './components/PronunciationTipModal';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import {
  fetchRandomSentence,
  evaluateAudio,
  loadProgress,
  saveProgress,
  calculateXpGain,
  getXpForLevel,
  updateStreak,
  type WordResult,
  type Sentence,
  type UserProgress,
  type AiFeedback,
} from './services/api';
import {
  checkAchievements,
  loadAchievements,
  getLevelUnlockStatus,
  type Achievement,
} from './services/achievements';
import { saveSessionEntry } from './services/sessionHistory';

type AppState = 'idle' | 'recording' | 'processing' | 'success' | 'tryAgain';

function App() {
  const [sentence, setSentence] = useState<Sentence | null>(null);
  const [appState, setAppState] = useState<AppState>('idle');
  const [comparison, setComparison] = useState<WordResult[] | null>(null);
  const [transcription, setTranscription] = useState('');
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Difficulty
  const [difficulty, setDifficulty] = useState(1);

  // Session stats
  const [attempts, setAttempts] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  // XP system
  const [progress, setProgress] = useState<UserProgress>(loadProgress);
  const [xpGained, setXpGained] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Navigation
  const [activeTab, setActiveTab] = useState<TabId>('practice');

  // Achievements
  const [achievements, setAchievements] = useState<Achievement[]>(loadAchievements);

  // Mobile difficulty picker
  const [showMobileDifficulty, setShowMobileDifficulty] = useState(false);

  // AI feedback (Phase 3)
  const [aiFeedback, setAiFeedback] = useState<AiFeedback | null>(null);
  const [tipWord, setTipWord] = useState<string | null>(null);

  const { isRecording, startRecording, stopRecording, error: micError, analyserNode } =
    useAudioRecorder();

  // Load persisted progress on mount
  useEffect(() => {
    const saved = loadProgress();
    setProgress(saved);
    setBestScore(saved.bestScore);
    setAttempts(saved.totalAttempts);
    setCurrentStreak(saved.streak);
    setAchievements(loadAchievements());
  }, []);

  // Show mic error as toast
  useEffect(() => {
    if (micError) showToast(micError, 'error');
  }, [micError]);

  // Level unlock status
  const unlockStatus = getLevelUnlockStatus(progress.xp, progress.level, attempts);

  // Load a sentence on mount and when difficulty changes
  const loadSentence = useCallback(async () => {
    try {
      setLoading(true);
      setComparison(null);
      setTranscription('');
      setAppState('idle');
      setXpGained(0);
      setAiFeedback(null);
      const data = await fetchRandomSentence(difficulty);
      setSentence(data);
    } catch {
      showToast('Could not load a sentence. Is the backend running?', 'error');
    } finally {
      setLoading(false);
    }
  }, [difficulty]);

  useEffect(() => {
    loadSentence();
  }, [loadSentence]);

  // Handle difficulty change (with unlock check)
  const handleDifficultyChange = (level: number) => {
    if (level === 2 && !unlockStatus.medium) {
      showToast('🔒 Reach Level 3 or 10 attempts to unlock Medium!', 'info');
      return;
    }
    if (level === 3 && !unlockStatus.hard) {
      showToast('🔒 Reach Level 6 or 30 attempts to unlock Hard!', 'info');
      return;
    }
    setDifficulty(level);
    setShowMobileDifficulty(false);
  };

  // Start recording
  const handleStartRecording = async () => {
    setComparison(null);
    setTranscription('');
    setXpGained(0);
    setAiFeedback(null);
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
      setTranscription(result.transcription);
      setScore(result.score);
      setCorrectCount(result.correct_count);
      setTotalCount(result.total_count);

      // Store AI feedback from Groq (may be null if service unavailable)
      setAiFeedback(result.ai_feedback || null);

      // Update session stats
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      const newBest = Math.max(bestScore, result.score);
      if (result.score > bestScore) setBestScore(result.score);

      // Calculate XP gain
      const earned = calculateXpGain(result.score, result.total_count);
      setXpGained(earned);

      // Update progress — level up when XP threshold reached
      const newXp = progress.xp + earned;
      let newLevel = progress.level;
      let cumulativeXp = 0;
      for (let l = 1; l <= newLevel; l++) cumulativeXp += getXpForLevel(l);
      while (newXp >= cumulativeXp + getXpForLevel(newLevel + 1)) {
        cumulativeXp += getXpForLevel(newLevel + 1);
        newLevel++;
      }
      if (newLevel > progress.level) {
        setShowLevelUp(true);
      }

      // Update streak
      const newStreak = result.score >= 80 ? currentStreak + 1 : 0;
      setCurrentStreak(newStreak);
      const dayStreak = updateStreak();

      const updatedProgress: UserProgress = {
        xp: newXp,
        level: newLevel,
        streak: dayStreak,
        bestScore: newBest,
        totalAttempts: newAttempts,
      };
      setProgress(updatedProgress);
      saveProgress(updatedProgress);

      // Save session history entry
      const wordsMissed = result.comparison
        .filter((w) => w.status === 'incorrect')
        .map((w) => w.word);
      saveSessionEntry({
        timestamp: Date.now(),
        sentenceId: sentence.id,
        sentence: sentence.content,
        score: result.score,
        difficulty,
        wordsMissed,
        xpEarned: earned,
        totalWords: result.total_count,
        correctWords: result.correct_count,
      });

      // Check achievements
      const newUnlockStatus = getLevelUnlockStatus(newXp, newLevel, newAttempts);
      const { achievements: updatedAch, newlyUnlocked } = checkAchievements({
        totalAttempts: newAttempts,
        currentStreak: newStreak,
        totalXp: newXp,
        lastScore: result.score,
        lastDifficulty: difficulty,
        mediumUnlocked: newUnlockStatus.medium,
        hardUnlocked: newUnlockStatus.hard,
      });
      setAchievements(updatedAch);

      // Show achievement toasts
      newlyUnlocked.forEach((a) => {
        setTimeout(() => {
          showToast(`🎖️ Badge unlocked: ${a.emoji} ${a.title}!`, 'success');
        }, 500);
      });

      // Success or try again
      if (result.score >= 80) {
        setAppState('success');
        setShowConfetti(true);
        showToast(
          result.score === 100
            ? `PERFECT! +${earned} XP 🌟`
            : `Great job! +${earned} XP ⭐`,
          'success'
        );
        setTimeout(() => setShowConfetti(false), 3500);
      } else {
        setAppState('tryAgain');
        showToast(`+${earned} XP — Tap red words to hear them! 🔊`, 'info');
      }
    } catch {
      showToast('Something went wrong. Please try again!', 'error');
      setAppState('idle');
    }
  };

  // Open pronunciation tip modal for a word (speaks it + shows AI tips)
  const handleWordClick = (word: string) => {
    // Speak the word immediately
    const stripped = word.replace(/[^a-zA-Z'-]/g, '');
    const utterance = new SpeechSynthesisUtterance(stripped);
    utterance.lang = 'en-US';
    utterance.rate = 0.75;
    utterance.pitch = 1.1;
    speechSynthesis.speak(utterance);

    // Open the detailed tip modal
    setTipWord(word);
  };

  // Try the same sentence again
  const handleTryAgain = () => {
    setComparison(null);
    setTranscription('');
    setXpGained(0);
    setAiFeedback(null);
    setAppState('idle');
  };

  // Handle progress update from Rewards page (e.g. daily chest XP)
  const handleProgressUpdate = (updated: UserProgress) => {
    setProgress(updated);
  };

  // ── Render active tab content ──
  const renderTabContent = () => {
    switch (activeTab) {
      case 'rewards':
        return (
          <RewardsPage
            achievements={achievements}
            progress={progress}
            onProgressUpdate={handleProgressUpdate}
          />
        );
      case 'dashboard':
        return <ParentDashboard />;
      case 'profile':
        return <ProfilePage progress={progress} achievements={achievements} />;
      default:
        return renderPracticeTab();
    }
  };

  const renderPracticeTab = () => (
    <>
      {/* ── Mobile top bar: logo + mascot inline ── */}
      <div className="lg:hidden flex items-center gap-3">
        <div className="card-brutal bg-gradient-to-r from-monkey-orange to-banana-yellow px-3 py-2 flex items-center gap-2">
          <span className="text-xl">🐵</span>
          <span className="text-sm font-extrabold font-[Fredoka] text-gray-900">Talkie Monkey</span>
        </div>
        <div className="ml-auto">
          <MonkeyMascot state={appState} compact />
        </div>
      </div>

      {/* ── Mobile difficulty selector ── */}
      <div className="lg:hidden">
        <DifficultySelector
          current={difficulty}
          onChange={handleDifficultyChange}
          unlockStatus={unlockStatus}
        />
      </div>

      {/* ── Content Area: Single column, mobile-first ── */}
      <div className="flex flex-col gap-3 flex-1 min-h-0">
        {/* Sentence Card */}
        {loading ? (
          <div className="card-brutal bg-white p-6 md:p-8 flex items-center justify-center">
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
            onWordClick={handleWordClick}
            difficulty={difficulty}
          />
        ) : null}

        {/* Transcription — "You said" feedback */}
        {transcription && comparison && (
          <TranscriptionDisplay
            transcription={transcription}
            score={score}
            hasAiFeedback={!!aiFeedback}
          />
        )}

        {/* Score (when available) */}
        {comparison && (
          <ScoreDisplay
            score={score}
            correctCount={correctCount}
            totalCount={totalCount}
            xpGained={xpGained}
          />
        )}

        {/* AI Feedback Card (from Groq) */}
        {aiFeedback && comparison && (
          <AiFeedbackCard
            feedback={aiFeedback}
            onWordTipClick={handleWordClick}
          />
        )}

        {/* ── Record Button (centered, big CTA) ── */}
        {sentence && !loading && appState !== 'success' && appState !== 'tryAgain' && (
          <div className="flex flex-col items-center py-4">
            <RecordButton
              isRecording={isRecording}
              isProcessing={appState === 'processing'}
              onStart={handleStartRecording}
              onStop={handleStopRecording}
              analyserNode={analyserNode}
            />
          </div>
        )}

        {/* Desktop mascot (hidden on mobile) */}
        {sentence && !loading && (
          <div className="hidden lg:flex justify-center">
            <MonkeyMascot state={appState} />
          </div>
        )}

        {/* Action buttons (when results) */}
        <ActionButtons
          hasResults={comparison !== null}
          onTryAgain={handleTryAgain}
          onNextSentence={loadSentence}
        />

        {/* Hint text when results shown (mobile) */}
        {(appState === 'success' || appState === 'tryAgain') && (
          <div className="text-center animate-float-in lg:hidden">
            <p className="text-sm font-bold text-white/70 font-[Fredoka] drop-shadow">
              {appState === 'success'
                ? '🎉 Awesome! Try the next one!'
                : '👆 Tap red words to hear them, then try again!'}
            </p>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      {/* ── Animated background ── */}
      <JungleBackground />

      {/* ── Confetti overlay ── */}
      <Confetti active={showConfetti} />

      {/* ── Toast notifications ── */}
      <ToastContainer />

      {/* ── Level Up Modal ── */}
      {showLevelUp && (
        <LevelUpModal
          level={progress.level}
          onClose={() => setShowLevelUp(false)}
        />
      )}

      {/* ── Pronunciation Tip Modal (Phase 3) ── */}
      {tipWord && (
        <PronunciationTipModal
          word={tipWord}
          onClose={() => setTipWord(null)}
        />
      )}

      {/* ── Mobile difficulty picker overlay ── */}
      {showMobileDifficulty && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setShowMobileDifficulty(false)}
        >
          <div
            className="w-full max-w-md mx-3 mb-20 card-brutal bg-white p-5 animate-float-in"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest font-[Fredoka] mb-3">
              Choose Difficulty
            </p>
            <DifficultySelector
              current={difficulty}
              onChange={handleDifficultyChange}
              unlockStatus={unlockStatus}
            />
          </div>
        </div>
      )}

      {/* ── Main dashboard grid ── */}
      <div className="relative z-10 h-full w-full p-3 md:p-4 lg:p-5 pb-20 lg:pb-5">
        <div className="h-full grid grid-cols-1 lg:grid-cols-[240px_1fr] xl:grid-cols-[280px_1fr] gap-3 md:gap-4">

          {/* ── LEFT SIDEBAR (hidden on mobile, shown on lg+) ── */}
          <aside className="hidden lg:flex flex-col gap-3 overflow-y-auto custom-scrollbar">
            <ProgressTracker
              attempts={attempts}
              bestScore={bestScore}
              currentStreak={currentStreak}
              state={appState}
              difficulty={difficulty}
              onDifficultyChange={handleDifficultyChange}
              xp={progress.xp}
              level={progress.level}
              activeTab={activeTab}
              onTabChange={(t) => setActiveTab(t as TabId)}
            />
          </aside>

          {/* ── MAIN CONTENT AREA ── */}
          <main className="flex flex-col gap-3 min-h-0 overflow-y-auto custom-scrollbar">

            {/* ── XP Progress Bar (always visible) ── */}
            <XpProgressBar
              xp={progress.xp}
              level={progress.level}
              xpGained={xpGained}
            />

            {/* ── Active Tab Content ── */}
            {renderTabContent()}

            {/* ── Bottom decorative strip ── */}
            <div className="flex items-center justify-center gap-2 py-1 opacity-50">
              <span className="text-xs font-bold text-white/60 font-[Fredoka]">
                🐵 Talkie Monkey v3 — AI-Powered Pronunciation Coach
              </span>
            </div>
          </main>
        </div>
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
}

export default App;
