import {
  getWeeklyScores,
  getFrequentlyMissedWords,
  getTotalPracticeTime,
  getImprovementTrend,
  getDifficultyBreakdown,
  loadSessionHistory,
} from '../services/sessionHistory';

/**
 * Parent Dashboard — charts & analytics for monitoring child progress.
 * All data sourced from localStorage session history.
 */
export default function ParentDashboard() {
  const weeklyScores = getWeeklyScores();
  const missedWords = getFrequentlyMissedWords(8);
  const practiceTime = getTotalPracticeTime();
  const improvementTrend = getImprovementTrend();
  const diffBreakdown = getDifficultyBreakdown();
  const history = loadSessionHistory();
  const totalSessions = history.length;

  const overallAvg =
    totalSessions > 0
      ? Math.round(history.reduce((s, e) => s + e.score, 0) / totalSessions)
      : 0;

  const maxBarHeight = 100; // px for chart bars

  return (
    <div className="flex flex-col gap-4 p-1">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold font-[Fredoka] text-white drop-shadow-md">
          📊 Parent Dashboard
        </h2>
        <p className="text-sm font-bold text-white/70 font-[Fredoka]">
          Track your child's pronunciation progress
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Sessions', value: totalSessions, emoji: '📝', color: 'bg-sky-blue/20' },
          { label: 'Average Score', value: `${overallAvg}%`, emoji: '🎯', color: 'bg-jungle-light' },
          { label: 'Today', value: `${practiceTime.todayMinutes}m`, emoji: '⏱️', color: 'bg-banana-light' },
          { label: 'This Week', value: `${practiceTime.weekMinutes}m`, emoji: '📅', color: 'bg-monkey-light' },
        ].map((stat) => (
          <div key={stat.label} className={`card-brutal-sm p-3 ${stat.color}`}>
            <span className="text-xl">{stat.emoji}</span>
            <div className="text-lg font-extrabold font-[Fredoka] text-gray-900">{stat.value}</div>
            <div className="text-[10px] font-bold text-gray-500 font-[Fredoka] uppercase tracking-wider">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Accuracy Chart */}
      <div className="card-brutal bg-white p-4 md:p-5">
        <h3 className="text-sm font-extrabold font-[Fredoka] text-gray-800 uppercase tracking-wider mb-4">
          📈 Weekly Accuracy
        </h3>
        {totalSessions === 0 ? (
          <div className="text-center py-8 text-gray-400 font-[Fredoka] font-bold">
            No data yet — start practicing! 🐵
          </div>
        ) : (
          <div className="flex items-end justify-between gap-2 h-32">
            {weeklyScores.map((d) => {
              const barH = Math.max((d.avgScore / 100) * maxBarHeight, 4);
              const barColor =
                d.avgScore >= 80
                  ? 'bg-gradient-to-t from-jungle-green to-jungle-dark'
                  : d.avgScore >= 50
                  ? 'bg-gradient-to-t from-monkey-orange to-banana-yellow'
                  : d.avgScore > 0
                  ? 'bg-gradient-to-t from-sunset-pink to-red-400'
                  : 'bg-gray-200';

              return (
                <div key={d.day} className="flex flex-col items-center gap-1 flex-1">
                  {d.count > 0 && (
                    <span className="text-[10px] font-extrabold font-[Fredoka] text-gray-600">
                      {d.avgScore}%
                    </span>
                  )}
                  <div
                    className={`w-full max-w-[40px] rounded-t-lg border-2 border-[#2d3436] transition-all duration-700 ${barColor}`}
                    style={{ height: `${barH}px` }}
                  />
                  <span className="text-[10px] font-bold text-gray-500 font-[Fredoka]">
                    {d.day}
                  </span>
                  <span className="text-[9px] font-bold text-gray-300 font-[Fredoka]">
                    {d.count > 0 ? `${d.count}x` : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Improvement Trend */}
      <div className="card-brutal bg-white p-4 md:p-5">
        <h3 className="text-sm font-extrabold font-[Fredoka] text-gray-800 uppercase tracking-wider mb-4">
          📊 Improvement Trend (4 Weeks)
        </h3>
        {totalSessions === 0 ? (
          <div className="text-center py-6 text-gray-400 font-[Fredoka] font-bold text-sm">
            Need more data! Keep practicing 💪
          </div>
        ) : (
          <div className="flex items-end justify-between gap-3 h-24">
            {improvementTrend.map((w) => {
              const barH = Math.max((w.avgScore / 100) * 80, 4);
              return (
                <div key={w.week} className="flex flex-col items-center gap-1 flex-1">
                  {w.avgScore > 0 && (
                    <span className="text-xs font-extrabold font-[Fredoka] text-grape-purple">
                      {w.avgScore}%
                    </span>
                  )}
                  <div
                    className="w-full max-w-[50px] rounded-t-lg border-2 border-[#2d3436] bg-gradient-to-t from-grape-purple to-berry-pink transition-all duration-700"
                    style={{ height: `${barH}px`, opacity: w.avgScore > 0 ? 1 : 0.2 }}
                  />
                  <span className="text-[10px] font-bold text-gray-500 font-[Fredoka]">
                    {w.week}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Difficulty Breakdown + Missed Words side by side on larger screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Difficulty Breakdown */}
        <div className="card-brutal bg-white p-4">
          <h3 className="text-sm font-extrabold font-[Fredoka] text-gray-800 uppercase tracking-wider mb-3">
            🌱 Difficulty Breakdown
          </h3>
          <div className="flex flex-col gap-2">
            {diffBreakdown.map((d) => {
              const diffLabels = ['', '🌱 Easy', '🌿 Medium', '🌳 Hard'];
              const diffColors = ['', 'bg-jungle-green', 'bg-monkey-orange', 'bg-sunset-pink'];
              return (
                <div key={d.difficulty} className="flex items-center gap-3">
                  <span className="text-sm font-bold font-[Fredoka] text-gray-700 w-24">
                    {diffLabels[d.difficulty]}
                  </span>
                  <div className="flex-1 h-5 bg-gray-100 rounded-full border border-[#2d3436] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${diffColors[d.difficulty]} transition-all duration-500`}
                      style={{ width: `${d.avgScore}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold font-[Fredoka] text-gray-500 w-16 text-right">
                    {d.count > 0 ? `${d.avgScore}% (${d.count})` : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Frequently Missed Words */}
        <div className="card-brutal bg-white p-4">
          <h3 className="text-sm font-extrabold font-[Fredoka] text-gray-800 uppercase tracking-wider mb-3">
            🔴 Frequently Missed Words
          </h3>
          {missedWords.length === 0 ? (
            <p className="text-sm text-gray-400 font-[Fredoka] font-bold py-4 text-center">
              No missed words yet! 🎉
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {missedWords.map((w) => (
                <div
                  key={w.word}
                  className="px-3 py-1.5 rounded-xl bg-sunset-light border-2 border-[#2d3436] shadow-[2px_2px_0_#2d3436]"
                >
                  <span className="text-sm font-bold font-[Fredoka] text-sunset-pink">
                    {w.word}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 ml-1">×{w.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tip */}
      <div className="card-brutal-sm bg-jungle-light p-4 text-center">
        <p className="text-sm font-bold text-jungle-dark font-[Fredoka]">
          💡 Tip: Encourage your child to practice missed words by tapping them during review!
        </p>
      </div>
    </div>
  );
}
