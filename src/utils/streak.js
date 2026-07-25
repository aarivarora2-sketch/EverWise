// Streak helpers shared by App, Home, and the completion celebration.

export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100, 180, 365];

export function dayString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(date, n) {
  const next = new Date(date);
  next.setDate(next.getDate() + n);
  return next;
}

/** Streak value after finishing a lesson today. */
export function nextStreak(prevStreak, lastCompletedDate, today) {
  if (lastCompletedDate === today) return prevStreak;
  const yesterday = dayString(addDays(new Date(), -1));
  if (lastCompletedDate === yesterday) return (prevStreak ?? 0) + 1;
  return 1;
}

/**
 * A streak is only "live" if the last lesson was today or yesterday.
 * Otherwise it has already lapsed and should read as 0.
 */
export function liveStreak(streak = 0, lastCompletedDate) {
  if (!streak || !lastCompletedDate) return 0;
  const today = dayString(new Date());
  const yesterday = dayString(addDays(new Date(), -1));
  if (lastCompletedDate === today || lastCompletedDate === yesterday) {
    return streak;
  }
  return 0;
}

export function isDoneToday(lastCompletedDate) {
  return lastCompletedDate === dayString(new Date());
}

/** True when they have a streak going but haven't practiced yet today. */
export function streakAtRisk(streak = 0, lastCompletedDate) {
  return liveStreak(streak, lastCompletedDate) > 0 && !isDoneToday(lastCompletedDate);
}

/**
 * Last 7 days ending today, oldest first, for the week strip.
 * [{ key, letter, done, isToday }]
 */
export function weekDays(streak = 0, lastCompletedDate, practiceDays = []) {
  const letters = ["S", "M", "T", "W", "T", "F", "S"];
  const history = new Set(practiceDays);
  const live = liveStreak(streak, lastCompletedDate);
  const today = new Date();
  const todayKey = dayString(today);

  // Backfill from the streak count so existing users see a filled week even
  // before per-day history starts being recorded.
  const streakDays = new Set();
  if (live > 0 && lastCompletedDate) {
    const [ly, lm, ld] = lastCompletedDate.split("-").map(Number);
    const last = new Date(ly, lm - 1, ld);
    for (let i = 0; i < live; i++) {
      streakDays.add(dayString(addDays(last, -i)));
    }
  }

  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i - 6);
    const key = dayString(date);
    return {
      key,
      letter: letters[date.getDay()],
      done: history.has(key) || streakDays.has(key),
      isToday: key === todayKey,
    };
  });
}

/** The milestone just reached, or null. */
export function milestoneReached(streak) {
  return STREAK_MILESTONES.includes(streak) ? streak : null;
}

export function nextMilestone(streak = 0) {
  return STREAK_MILESTONES.find((m) => m > streak) ?? null;
}
