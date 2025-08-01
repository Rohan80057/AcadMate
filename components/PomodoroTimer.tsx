import React, { useState, useEffect, useRef, useCallback } from 'react';

const PomodoroTimer: React.FC = () => {
  const [duration, setDuration] = useState(25 * 60); // 25 minutes in seconds
  const [secondsLeft, setSecondsLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    setSecondsLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            const nextMode = mode === 'work' ? 'break' : 'work';
            const nextDuration = nextMode === 'work' ? 25 * 60 : 5 * 60;
            alert(mode === 'work' ? "Time for a break! Take 5 minutes." : "Break's over! Back to work.");
            setMode(nextMode);
            setDuration(nextDuration);
            return nextDuration;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode]);

  const handleStartPause = () => setIsRunning(!isRunning);
  
  const handleReset = () => {
    setIsRunning(false);
    const resetDuration = mode === 'work' ? 25 * 60 : 5 * 60;
    setDuration(resetDuration);
    setSecondsLeft(resetDuration);
  };
  
  const switchMode = (newMode: 'work' | 'break') => {
      setIsRunning(false);
      setMode(newMode);
      const newDuration = newMode === 'work' ? 25 * 60 : 5 * 60;
      setDuration(newDuration);
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };
  
  const progress = (secondsLeft / duration) * 100;
  const circumference = 2 * Math.PI * 90; // 2 * pi * r
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-3xl shadow-lg p-8 text-center">
        <div className="flex justify-center gap-4 mb-8">
            <button onClick={() => switchMode('work')} className={`px-6 py-2 rounded-full font-semibold transition-colors ${mode === 'work' ? 'bg-primary text-white' : 'bg-light-bg-tertiary dark:bg-dark-bg-tertiary'}`}>Work</button>
            <button onClick={() => switchMode('break')} className={`px-6 py-2 rounded-full font-semibold transition-colors ${mode === 'break' ? 'bg-primary-light text-white' : 'bg-light-bg-tertiary dark:bg-dark-bg-tertiary'}`}>Break</button>
        </div>

        <div className="relative w-64 h-64 mx-auto mb-8">
            <svg className="w-full h-full" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="90" className="stroke-current text-light-bg-tertiary dark:text-dark-bg-tertiary" strokeWidth="10" fill="transparent" />
                <circle
                    cx="100"
                    cy="100"
                    r="90"
                    className="stroke-current text-primary"
                    strokeWidth="10"
                    fill="transparent"
                    strokeLinecap="round"
                    transform="rotate(-90 100 100)"
                    style={{ strokeDasharray: circumference, strokeDashoffset, transition: 'stroke-dashoffset 0.35s' }}
                />
            </svg>
           <div className="absolute inset-0 flex flex-col items-center justify-center">
             <span className="text-6xl font-mono font-bold text-light-text dark:text-dark-text">
                {formatTime(secondsLeft)}
              </span>
              <span className="text-lg text-light-text-secondary dark:text-dark-text-secondary tracking-widest uppercase mt-2">{mode}</span>
           </div>
        </div>
        
        <div className="flex justify-center gap-4">
          <button
            onClick={handleStartPause}
            className={`w-32 px-8 py-3 text-xl font-semibold text-white rounded-xl shadow-lg transition-all duration-300 hover:scale-105 ${isRunning ? 'bg-red-500 shadow-red-500/30' : 'bg-primary shadow-primary/30'}`}
          >
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={handleReset}
            className="w-32 px-8 py-3 text-xl font-semibold bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-xl hover:scale-105 transition-transform"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;