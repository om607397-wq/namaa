import { 
  UserProfile, 
  StudySession, 
  QuranLog, 
  Expense, 
  Budget, 
  DailyReview, 
  WeeklyReview, 
  ScreenTimeLog, 
  TasbeehLog, 
  AppSettings, 
  PrayerLog, 
  DailyHabits, 
  FocusList, 
  PrayerStatus,
  RamadanDay,
  RamadanConfig,
  HabitConfig,
  QuranTaskConfig,
  FootballProfile,
  FootballTrainingLog,
  FeatureId,
  ChatMessage,
  LocationConfig,
  AdhkarProgress,
  DailyToDo
} from '../types';
import { ADHKAR_DATA, DhikrItem } from '../data/adhkarData';

const KEYS = {
  PROFILE: 'injaz_profile',
  STUDY: 'injaz_study',
  QURAN: 'injaz_quran',
  QURAN_CONFIG: 'injaz_quran_config',
  EXPENSE: 'injaz_expense',
  BUDGET: 'injaz_budget',
  DAILY_REVIEW: 'injaz_daily_review',
  WEEKLY_REVIEW: 'injaz_weekly_review',
  SCREEN_TIME: 'injaz_screen_time',
  TASBEEH: 'injaz_tasbeeh',
  SETTINGS: 'injaz_settings',
  PRAYERS: 'injaz_prayers',
  HABITS: 'injaz_habits',
  HABITS_CONFIG: 'injaz_habits_config',
  FOCUS: 'injaz_focus',
  RAMADAN_LOGS: 'injaz_ramadan_logs',
  RAMADAN_CONFIG: 'injaz_ramadan_config',
  FOOTBALL_PROFILE: 'injaz_football_profile',
  FOOTBALL_LOGS: 'injaz_football_logs',
  ENABLED_FEATURES: 'injaz_enabled_features',
  CHAT_HISTORY: 'injaz_chat_history',
  ADHKAR_CONTENT: 'injaz_adhkar_content',
  LOCATION_CONFIG: 'injaz_location_config',
  ADHKAR_PROGRESS: 'injaz_adhkar_progress', // New
  DAILY_TODO: 'injaz_daily_todo', // New
};

// Helper to get today's date string YYYY-MM-DD
export const getTodayKey = () => new Date().toISOString().split('T')[0];

function get<T>(key: string, defaultVal: T): T {
  try {
    const data = localStorage.getItem(key);
    if (!data || data === "undefined" || data === "null") return defaultVal;
    return JSON.parse(data);
  } catch (e) {
    console.warn(`Error parsing key ${key}, resetting to default.`, e);
    return defaultVal;
  }
}

function set<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving key ${key}`, e);
  }
}

// --- Cloud Sync Helpers ---
export const getAllAppData = () => {
  const data: Record<string, any> = {};
  Object.values(KEYS).forEach(key => {
    const val = localStorage.getItem(key);
    if (val) {
      try {
        data[key] = JSON.parse(val);
      } catch (e) {
        data[key] = val;
      }
    }
  });
  return data;
};

export const restoreAppData = (data: Record<string, any>) => {
  Object.keys(data).forEach(key => {
    if (Object.values(KEYS).includes(key)) {
      if (typeof data[key] === 'object') {
        localStorage.setItem(key, JSON.stringify(data[key]));
      } else {
        localStorage.setItem(key, data[key]);
      }
    }
  });
};


// --- Existing Functions ---
export const getProfile = (): UserProfile => get(KEYS.PROFILE, { 
  name: 'يا بطل', 
  streak: 0, 
  lastCompletedDate: null,
  avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Felix',
  quranBookmark: 0
});
export const updateProfile = (profile: UserProfile) => set(KEYS.PROFILE, profile);

export const saveQuranBookmark = (page: number) => {
  const profile = getProfile();
  updateProfile({ ...profile, quranBookmark: page });
};

export const getStudySessions = (): StudySession[] => get(KEYS.STUDY, []);
export const addStudySession = (session: StudySession) => {
  const sessions = getStudySessions();
  set(KEYS.STUDY, [...sessions, session]);
};

export const getLast7DaysStudy = () => {
  const sessions = getStudySessions();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('ar-EG', { weekday: 'short' });
    
    const totalMinutes = sessions
      .filter(s => s.date === dateKey)
      .reduce((acc, curr) => acc + curr.durationMinutes, 0);
      
    days.push({ name: dayName, hours: +(totalMinutes / 60).toFixed(1) });
  }
  return days;
};

// --- Quran (Customizable Defaults) ---
export const getQuranConfig = (): QuranTaskConfig[] => get(KEYS.QURAN_CONFIG, [
  { id: '1', label: 'ورد التلاوة اليومي' },
]);
export const saveQuranConfig = (config: QuranTaskConfig[]) => set(KEYS.QURAN_CONFIG, config);

export const getQuranLog = (date: string): QuranLog => {
  const logs = get<Record<string, QuranLog>>(KEYS.QURAN, {});
  return logs[date] || { date, completedTaskIds: [] };
};
export const updateQuranLog = (log: QuranLog) => {
  const logs = get<Record<string, QuranLog>>(KEYS.QURAN, {});
  logs[log.date] = log;
  set(KEYS.QURAN, logs);
  updateStreak(log.date);
};

const updateStreak = (date: string) => {
    const quran = getQuranLog(date);
    const config = getQuranConfig();
    if (config.length === 0) return;

    const isComplete = config.every(task => quran.completedTaskIds.includes(task.id));
    
    if (isComplete) {
      const profile = getProfile();
      if (profile.lastCompletedDate !== date) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayKey = yesterday.toISOString().split('T')[0];
        
        if (profile.lastCompletedDate === yesterdayKey) {
          profile.streak += 1;
        } else {
          profile.streak = 1;
        }
        profile.lastCompletedDate = date;
        updateProfile(profile);
      }
    }
}

export const getExpenses = (): Expense[] => get(KEYS.EXPENSE, []);
export const addExpense = (expense: Expense) => {
  const list = getExpenses();
  set(KEYS.EXPENSE, [...list, expense]);
};
export const getBudget = (): Budget | null => get(KEYS.BUDGET, null);
export const setBudget = (budget: Budget) => set(KEYS.BUDGET, budget);

export const getDailyReview = (date: string): DailyReview | null => {
  const reviews = get<Record<string, DailyReview>>(KEYS.DAILY_REVIEW, {});
  return reviews[date] || null;
};
export const saveDailyReview = (review: DailyReview) => {
  const reviews = get<Record<string, DailyReview>>(KEYS.DAILY_REVIEW, {});
  reviews[review.date] = review;
  set(KEYS.DAILY_REVIEW, reviews);
};

export const getWeeklyReviews = (): WeeklyReview[] => get(KEYS.WEEKLY_REVIEW, []);
export const saveWeeklyReview = (review: WeeklyReview) => {
  const reviews = getWeeklyReviews();
  set(KEYS.WEEKLY_REVIEW, [...reviews, review]);
};

export const getScreenTimeLog = (date: string): ScreenTimeLog => {
  const logs = get<Record<string, ScreenTimeLog>>(KEYS.SCREEN_TIME, {});
  return logs[date] || { date, limitMinutes: 60, usageMinutes: 0 };
};
export const saveScreenTimeLog = (log: ScreenTimeLog) => {
  const logs = get<Record<string, ScreenTimeLog>>(KEYS.SCREEN_TIME, {});
  logs[log.date] = log;
  set(KEYS.SCREEN_TIME, logs);
};

export const getTasbeehLog = (date: string): TasbeehLog => {
  const logs = get<Record<string, TasbeehLog>>(KEYS.TASBEEH, {});
  return logs[date] || { date, count: 0 };
};
export const saveTasbeehLog = (log: TasbeehLog) => {
  const logs = get<Record<string, TasbeehLog>>(KEYS.TASBEEH, {});
  logs[log.date] = log;
  set(KEYS.TASBEEH, logs);
};
export const getTotalTasbeeh = (): number => {
  const logs = get<Record<string, TasbeehLog>>(KEYS.TASBEEH, {});
  return Object.values(logs).reduce((sum, log) => sum + log.count, 0);
};

export const getAppSettings = (): AppSettings => get(KEYS.SETTINGS, { dhikrEnabled: true, darkMode: false });
export const saveAppSettings = (settings: AppSettings) => set(KEYS.SETTINGS, settings);


// --- New Features Storage ---

export const getPrayerLog = (date: string): PrayerLog => {
  const logs = get<Record<string, PrayerLog>>(KEYS.PRAYERS, {});
  return logs[date] || { 
    date, 
    fajr: 'none', dhuhr: 'none', asr: 'none', maghrib: 'none', isha: 'none',
    fajrSunnah: false, dhuhrSunnah: false, asrSunnah: false, maghribSunnah: false, ishaSunnah: false,
    fajrAdhkar: false, dhuhrAdhkar: false, asrAdhkar: false, maghribAdhkar: false, ishaAdhkar: false,
  };
};

export const savePrayerLog = (log: PrayerLog) => {
  const logs = get<Record<string, PrayerLog>>(KEYS.PRAYERS, {});
  logs[log.date] = log;
  set(KEYS.PRAYERS, logs);
};

export const getHabitsConfig = (): HabitConfig[] => get(KEYS.HABITS_CONFIG, [
  { id: '1', name: 'أكل صحي', emoji: '🥗' }
]);
export const saveHabitsConfig = (config: HabitConfig[]) => set(KEYS.HABITS_CONFIG, config);

export const getDailyHabits = (date: string): DailyHabits => {
  const logs = get<Record<string, DailyHabits>>(KEYS.HABITS, {});
  return logs[date] || { date, completedHabitIds: [], waterCups: 0 };
};

export const saveDailyHabits = (log: DailyHabits) => {
  const logs = get<Record<string, DailyHabits>>(KEYS.HABITS, {});
  logs[log.date] = log;
  set(KEYS.HABITS, logs);
};

export const getFocusList = (date: string): FocusList => {
  const logs = get<Record<string, FocusList>>(KEYS.FOCUS, {});
  return logs[date] || { date, tasks: [] };
};

export const saveFocusList = (list: FocusList) => {
  const logs = get<Record<string, FocusList>>(KEYS.FOCUS, {});
  logs[list.date] = list;
  set(KEYS.FOCUS, logs);
};

// --- Adhkar Progress Storage ---
export const getAdhkarProgress = (date: string): AdhkarProgress => {
  const logs = get<Record<string, AdhkarProgress>>(KEYS.ADHKAR_PROGRESS, {});
  return logs[date] || { date, completedCategories: [] };
};

export const saveAdhkarProgress = (progress: AdhkarProgress) => {
  const logs = get<Record<string, AdhkarProgress>>(KEYS.ADHKAR_PROGRESS, {});
  logs[progress.date] = progress;
  set(KEYS.ADHKAR_PROGRESS, logs);
};

// --- Daily ToDo Storage ---
export const getDailyToDo = (date: string): DailyToDo => {
  const logs = get<Record<string, DailyToDo>>(KEYS.DAILY_TODO, {});
  return logs[date] || { date, tasks: [] };
};

export const saveDailyToDo = (todo: DailyToDo) => {
  const logs = get<Record<string, DailyToDo>>(KEYS.DAILY_TODO, {});
  logs[todo.date] = todo;
  set(KEYS.DAILY_TODO, logs);
};

export const getRamadanDay = (date: string): RamadanDay => {
  const logs = get<Record<string, RamadanDay>>(KEYS.RAMADAN_LOGS, {});
  return logs[date] || { date, fasting: false, tarawih: false, qiyam: false, iftarInvite: false, goodDeed: '' };
};

export const saveRamadanDay = (day: RamadanDay) => {
  const logs = get<Record<string, RamadanDay>>(KEYS.RAMADAN_LOGS, {});
  logs[day.date] = day;
  set(KEYS.RAMADAN_LOGS, logs);
};

export const getRamadanConfig = (): RamadanConfig => {
  return get(KEYS.RAMADAN_CONFIG, { 
    khatmaGrid: new Array(30).fill(false),
    duas: [] 
  });
};

export const saveRamadanConfig = (config: RamadanConfig) => {
  set(KEYS.RAMADAN_CONFIG, config);
};

export const getFootballProfile = (): FootballProfile => {
  return get(KEYS.FOOTBALL_PROFILE, { position: null, trainingDays: [], level: 1 });
};

export const saveFootballProfile = (profile: FootballProfile) => {
  set(KEYS.FOOTBALL_PROFILE, profile);
};

export const getFootballLogs = (): Record<string, FootballTrainingLog> => {
  return get(KEYS.FOOTBALL_LOGS, {});
};

export const getFootballLog = (date: string): FootballTrainingLog => {
  const logs = get<Record<string, FootballTrainingLog>>(KEYS.FOOTBALL_LOGS, {});
  return logs[date] || { 
    date, 
    completed: false, 
    ratings: { physical: 0, mental: 0, technical: 0 }, 
    notes: '' 
  };
};

export const saveFootballLog = (log: FootballTrainingLog) => {
  const logs = get<Record<string, FootballTrainingLog>>(KEYS.FOOTBALL_LOGS, {});
  logs[log.date] = log;
  set(KEYS.FOOTBALL_LOGS, logs);
};

export const getEnabledFeatures = (): FeatureId[] => {
  const features = get<FeatureId[] | null>(KEYS.ENABLED_FEATURES, null);
  if (!features) {
    return ['prayers', 'quran', 'habits', 'study', 'finance', 'focus', 'tasbeeh', 'adhkar', 'history', 'todo']; 
  }
  return features;
};

export const saveEnabledFeatures = (features: FeatureId[]) => {
  set(KEYS.ENABLED_FEATURES, features);
};

export const getChatHistory = (): ChatMessage[] => {
  return get(KEYS.CHAT_HISTORY, []);
};

export const saveChatHistory = (history: ChatMessage[]) => {
  set(KEYS.CHAT_HISTORY, history);
};

export const clearChatHistory = () => {
  localStorage.removeItem(KEYS.CHAT_HISTORY);
};

// --- Adhkar Content (Static File Source) ---
export const getAdhkarByCategory = (category: string): DhikrItem[] => {
  // Always return from file source
  return ADHKAR_DATA[category] || [];
};

// --- Location Storage ---
export const getLocationConfig = (): LocationConfig | null => {
  return get(KEYS.LOCATION_CONFIG, null);
};

export const saveLocationConfig = (config: LocationConfig) => {
  set(KEYS.LOCATION_CONFIG, config);
};

// --- Gamification Score ---
export const calculateDailyScore = (date: string): number => {
  let score = 0;
  // Total score components:
  // Prayers: 40
  // Quran: 15
  // Study: 15
  // Habits: 10
  // Adhkar: 10
  // ToDo: 10
  const maxScore = 100;

  // 1. Prayers (Max 40)
  const prayers = getPrayerLog(date);
  const prayerScores: Record<PrayerStatus, number> = { 'mosque': 6, 'ontime': 6, 'late': 3, 'missed': 0, 'none': 0 };
  
  score += prayerScores[prayers.fajr] + prayerScores[prayers.dhuhr] + prayerScores[prayers.asr] + prayerScores[prayers.maghrib] + prayerScores[prayers.isha];
  
  if (prayers.fajrSunnah) score += 1;
  if (prayers.dhuhrSunnah) score += 1;
  if (prayers.asrSunnah) score += 1;
  if (prayers.maghribSunnah) score += 1;
  if (prayers.ishaSunnah) score += 1;

  // 2. Quran (Max 15)
  const quran = getQuranLog(date);
  const quranConfig = getQuranConfig();
  if (quranConfig.length > 0) {
    const quranDone = quran.completedTaskIds.length;
    score += (quranDone / quranConfig.length) * 15;
  }

  // 3. Study (Max 15)
  const study = getStudySessions().filter(s => s.date === date);
  const totalMinutes = study.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  if (totalMinutes >= 120) score += 15;
  else if (totalMinutes > 0) score += (totalMinutes / 120) * 15;

  // 4. Habits (Max 10)
  const habits = getDailyHabits(date);
  const habitsConfig = getHabitsConfig();
  
  let habitsScore = 0;
  if (habits.waterCups >= 8) habitsScore += 5;
  
  if (habitsConfig.length > 0) {
    const doneHabits = habits.completedHabitIds.length;
    habitsScore += (doneHabits / habitsConfig.length) * 5;
  }
  
  score += habitsScore;

  // 5. Adhkar (Max 10)
  const adhkar = getAdhkarProgress(date);
  // Important adhkar: morning, evening, sleep
  const importantCats = ['morning', 'evening', 'sleep'];
  const completedImportant = importantCats.filter(c => adhkar.completedCategories.includes(c)).length;
  score += (completedImportant / 3) * 10;

  // 6. ToDo (Max 10)
  const todo = getDailyToDo(date);
  if (todo.tasks.length > 0) {
    const doneTasks = todo.tasks.filter(t => t.completed).length;
    score += (doneTasks / todo.tasks.length) * 10;
  }

  return Math.min(Math.round(score), maxScore);
};