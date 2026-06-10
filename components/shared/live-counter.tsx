"use client";

import { useEffect, useState } from "react";
import { DollarSign } from "lucide-react";
import Pusher from "pusher-js";

interface LiveCounterProps {
  initialAmount: number;
}

export default function LiveCounter({ initialAmount }: LiveCounterProps) {
  const [amount, setAmount] = useState(initialAmount);
  const [displayAmount, setDisplayAmount] = useState(0);

  // Animated count up on initial mount
  useEffect(() => {
    let start = 0;
    const end = amount;
    if (end === 0) return;

    const duration = 1500; // 1.5 seconds
    const increment = end / (duration / 16); // ~60fps
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        setDisplayAmount(end);
      } else {
        setDisplayAmount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [amount]);

  // Real-time updates via Pusher
  useEffect(() => {
    // Initialize Pusher only if key is available
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY || "mock_pusher_key";
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "mock_pusher_cluster";

    if (pusherKey === "mock_pusher_key") {
      // Create a mock local event trigger for demonstration/testing
      const interval = setInterval(() => {
        const randomAmount = Math.floor(Math.random() * 240) + 10;
        setAmount((prev) => prev + randomAmount);
      }, 15000);
      return () => clearInterval(interval);
    }

    try {
      const pusher = new Pusher(pusherKey, {
        cluster: pusherCluster,
      });

      const channel = pusher.subscribe("global-counter");
      channel.bind("donation-received", (data: { amount: number }) => {
        setAmount((prev) => prev + data.amount);
      });

      return () => {
        channel.unbind_all();
        channel.unsubscribe();
        pusher.disconnect();
      };
    } catch (e) {
      console.warn("Pusher connection failed:", e);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-30 group-hover:opacity-60 transition-opacity" />
      <span className="text-xs uppercase font-bold tracking-widest text-slate-400 mb-2">
        Platform Total Donations
      </span>
      <div className="flex items-center gap-1">
        <DollarSign className="h-8 w-8 text-primary" />
        <span className="text-4xl md:text-5xl font-black text-white tracking-tight text-gradient">
          {displayAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-2.5">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
        Updating in Real-Time
      </span>
    </div>
  );
}
