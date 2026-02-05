import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Subject, StudyType, StudySession } from '../types';
import { addStudySession, getTodayKey } from '../services/storage';
import { useToast } from './ToastContext';
import { triggerConfetti } from '../services/confetti';

interface TimerContextType {
  isActive: boolean;
  isBreak: boolean;
  timeLeft: number;
  initialTime: number;
  subject: Subject;
  type: StudyType;
  toggleTimer: () => void;
  resetTimer: () => void;
  switchMode: (mode: 'focus' | 'break') => void;
  setStudyDetails: (subj: Subject, t: StudyType) => void;
  formatTime: (seconds: number) => string;
  progress: number;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [initialTime, setInitialTime] = useState(25 * 60);
  const [subject, setSubject] = useState<Subject>('رياضة');
  const [type, setType] = useState<StudyType>('فهم');
  
  const intervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio notification with a reliable URL
    audioRef.current = new Audio('https://media.geeksforgeeks.org/wp-content/uploads/20190531135120/beep.mp3');
    // Preload to ensure it's ready
    audioRef.current.load();
  }, []);

  const toggleTimer = () => {
    if (isActive) {
      clearInterval(intervalRef.current as number);
      setIsActive(false);
    } else {
      setIsActive(true);
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleTimerComplete = () => {
    clearInterval(intervalRef.current as number);
    setIsActive(false);
    
    // Play notification sound
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed', e));
    }

    if (!isBreak) {
      // Save session automatically
      const now = new Date();
      const endString = now.toTimeString().slice(0, 5);
      const startObj = new Date(now.getTime() - (initialTime * 1000)); 
      const startString = startObj.toTimeString().slice(0, 5);
      
      const newSession: StudySession = {
        id: Date.now().toString(),
        date: getTodayKey(),
        subject: subject,
        startTime: startString,
        endTime: endString,
        durationMinutes: Math.floor(initialTime / 60),
        type: type
      };

      addStudySession(newSession);
      showToast(`🎉 عاش يا بطل! تم تسجيل ${Math.floor(initialTime / 60)} دقيقة ${subject}.`, 'success');
      triggerConfetti(); // Celebrate focus completion
      switchMode('break');
    } else {
      showToast('☕ انتهى البريك! يلا نرجع نركز.', 'info');
      switchMode('focus');
    }
  };

  const resetTimer = () => {
    clearInterval(intervalRef.current as number);
    setIsActive(false);
    setTimeLeft(isBreak ? 5 * 60 : 25 * 60);
    setInitialTime(isBreak ? 5 * 60 : 25 * 60);
  };

  const switchMode = (mode: 'focus' | 'break') => {
    clearInterval(intervalRef.current as number);
    setIsActive(false);
    const time = mode === 'focus' ? 25 * 60 : 5 * 60;
    setIsBreak(mode === 'break');
    setTimeLeft(time);
    setInitialTime(time);
  };

  const setStudyDetails = (subj: Subject, t: StudyType) => {
    setSubject(subj);
    setType(t);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progress = ((initialTime - timeLeft) / initialTime) * 100;

  return (
    <TimerContext.Provider value={{
      isActive, isBreak, timeLeft, initialTime, subject, type,
      toggleTimer, resetTimer, switchMode, setStudyDetails, formatTime, progress
    }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};