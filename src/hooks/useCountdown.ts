import { useState, useEffect } from 'react';

/**
 * Custom hook to calculate the remaining time until a target date.
 * Returns an object with hours, minutes, and seconds, or null if the countdown has ended.
 */
export const useCountdown = (targetDate: string) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: string; minutes: string; seconds: string } | null>(null);

  useEffect(() => {
    if (!targetDate) {
      setTimeLeft(null);
      return;
    }

    const target = new Date(targetDate).getTime();
    if (!Number.isFinite(target)) {
      setTimeLeft(null);
      return;
    }

    const intervalId = setInterval(() => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        clearInterval(intervalId);
        setTimeLeft(null);
      } else {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({
          hours: String(hours).padStart(2, '0'),
          minutes: String(minutes).padStart(2, '0'),
          seconds: String(seconds).padStart(2, '0'),
        });
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [targetDate]);

  return timeLeft;
};
