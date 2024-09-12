// CountdownTimer.tsx

import React, { useEffect, useState } from "react";

const CountdownTimer = () => {
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Calculate the countdown timer
  const calculateCountdown = () => {
    const targetDate = new Date("April 11, 2024, 00:00:00").getTime();
    const now = new Date().getTime();
    const timezoneOffset = 8 * 60 * 60 * 1000; // Philippine Time (GMT+8)
    const distance = targetDate - now + timezoneOffset;

    // Calculating days, hours, minutes and seconds
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    setCountdown({ days, hours, minutes, seconds });
  };

  useEffect(() => {
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center gap-4">
      <div className="text-center">
        <span className="block text-5xl font-bold">{countdown.days}</span>
        <span className="text-xl">days left</span>
      </div>
      <div className="flex items-center justify-center gap-2">
        <div>{countdown.hours}h</div>
        <div>{countdown.minutes}m</div>
        <div>{countdown.seconds}s</div>
      </div>
    </div>
  );
};

export default CountdownTimer;