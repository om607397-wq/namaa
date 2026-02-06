
export interface UserProfile {
  name: string;
  avatar?: string; // New field for profile picture (URL or Base64)
  streak: number;
  lastCompletedDate: string | null;
  quranBookmark?: number; // Page number (1-604)
}

export type Subject = 'رياضة' | 'فيزياء' | 'كيمياء' | 'عربي' | 'إنجليزي';
export type StudyType = 'فهم' | 'حل' | 'مراجعة';

export interface StudySession {
  id: string;
  date: string;
  subject: Subject;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  type: StudyType;
}

// Changed: Dynamic Quran Tasks
export interface QuranTaskConfig {
  id: string;
  label: string;
}

export interface QuranLog {
  date: string;
  completedTaskIds: string[]; // List of IDs of completed tasks
}

export type ExpenseCategory = 'أكل' | 'مواصلات' | 'خروج' | 'كورة' | 'شخصي' | 'دروس';

export interface Expense {
  id: string;
  date: string;
  amount: number;
  category: ExpenseCategory;
  note?: string;
}

export interface Budget {
  startDate: string; // ISO Date of the beginning of the budget week
  amount: number;
}

export interface DailyReview {
  date: string;
  best: string;
  worst: string;
  improve: string;
}

export interface WeeklyReview {
  weekStartDate: string;
  achievement: string;
  shortcoming: string;
  nextGoal: string;
}

export interface ScreenTimeLog {
  date: string;
  limitMinutes: number;
  usageMinutes: number;
}

export type DhikrType = 'سبحان الله' | 'الحمد لله' | 'الله أكبر' | 'لا إله إلا الله' | 'أستغفر الله' | 'لا حول ولا قوة إلا بالله';

export interface TasbeehLog {
  date: string;
  count: number;
  favoriteDhikr?: DhikrType;
}

export interface AppSettings {
  dhikrEnabled: boolean;
  darkMode: boolean;
}

// --- New Features Types ---

export type PrayerStatus = 'mosque' | 'ontime' | 'late' | 'missed' | 'none';
export type PrayerName = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export interface PrayerLog {
  date: string;
  fajr: PrayerStatus;
  dhuhr: PrayerStatus;
  asr: PrayerStatus;
  maghrib: PrayerStatus;
  isha: PrayerStatus;
  
  // Sunan (Rawatib) & Adhkar
  fajrSunnah: boolean;
  dhuhrSunnah: boolean;
  asrSunnah: boolean;
  maghribSunnah: boolean;
  ishaSunnah: boolean;
  
  fajrAdhkar: boolean;
  dhuhrAdhkar: boolean;
  asrAdhkar: boolean;
  maghribAdhkar: boolean;
  ishaAdhkar: boolean;
}

// Changed: Dynamic Habits
export interface HabitConfig {
  id: string;
  name: string;
  emoji: string;
}

export interface DailyHabits {
  date: string;
  completedHabitIds: string[]; // List of IDs completed today
  waterCups: number; // Keep water separate as it's a counter
}

export interface FocusTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface FocusList {
  date: string;
  tasks: FocusTask[]; // Max 3 items
}

// --- Ramadan Features ---
export interface RamadanDay {
  date: string;
  fasting: boolean;
  tarawih: boolean;
  qiyam: boolean; // Tahajjud
  iftarInvite: boolean; // Did you invite someone or feed someone?
  goodDeed: string; // "Ihsan" text
}

export interface RamadanConfig {
  khatmaGrid: boolean[]; // Array of 30 booleans
  duas: { id: string, text: string }[];
}

// --- Football Features ---
export type FootballPosition = 'GK' | 'DEF' | 'MID' | 'FWD';

export interface FootballProfile {
  position: FootballPosition | null;
  trainingDays: number[]; // 0 = Sunday, 1 = Monday ... 6 = Saturday
  level: number; // Calculated based on consistency
}

export interface FootballTrainingLog {
  date: string;
  completed: boolean;
  ratings: {
    physical: number; // 1-5 stars
    mental: number; // 1-5 stars (Mentality)
    technical: number; // 1-5 stars (Skills)
  };
  notes: string;
}

// --- AI Chat Types ---
export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

// --- Location Config ---
export interface LocationConfig {
  name: string;
  lat: number;
  lng: number;
  isManual: boolean;
}

// --- Customization ---
export type FeatureId = 
  'ramadan' | 'football' | 'prayers' | 'adhkar' | 'study' | 
  'focus' | 'quran' | 'habits' | 'finance' | 'screentime' | 
  'tasbeeh' | 'journaling' | 'history'; // Added 'history'