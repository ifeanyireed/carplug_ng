"use client";

import React, { useState, useRef } from "react";
import { ArrowLeft, ArrowRight, Pause, Play, Volume2, VolumeX } from "lucide-react";

export interface CustomerStory {
  id: string;
  name: string;
  vehicle: string;
  videoSrc: string;
  initialProgress?: number;
}

const STORIES: CustomerStory[] = [
  {
    id: "story-1",
    name: "Portgass D. Ace",
    vehicle: "2019 Honda HR-V SE 1.5 Auto",
    videoSrc: "/images/stories/story1.mp4",
    initialProgress: 25,
  },
  {
    id: "story-2",
    name: "Figarland Shanks",
    vehicle: "2019 Daihatsu TERIOS X DLX 1.5 Manual",
    videoSrc: "/images/stories/story2.mp4",
    initialProgress: 5,
  },
  {
    id: "story-3",
    name: "Gol D. Roger",
    vehicle: "2018 Honda CR-V TURBO PRESTIGE 1.5 Auto",
    videoSrc: "/images/stories/story3.mp4",
    initialProgress: 5,
  },
];

interface StoryCardProps {
  story: CustomerStory;
  index: number;
}

const StoryCard = ({ story }: StoryCardProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(story.initialProgress || 0);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const duration = videoRef.current.duration;
    if (duration > 0) {
      setProgress((current / duration) * 100);
    }
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={togglePlay}
      className="relative w-full aspect-[3/4] sm:aspect-[3/4.2] rounded-2xl overflow-hidden group cursor-pointer shadow-sm bg-neutral-900 select-none hover:scale-[1.015] sm:hover:scale-[1.02] transition-all duration-300"
    >
      {/* Video Element (Plays on hover) */}
      <video
        ref={videoRef}
        src={story.videoSrc}
        loop
        muted={isMuted}
        playsInline
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
      />

      {/* Top Story Progress Bar */}
      <div className="absolute top-4 inset-x-4 z-20 flex items-center gap-1.5">
        <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm">
          <div
            className="h-full bg-white transition-all duration-150 ease-linear rounded-full"
            style={{ width: `${Math.max(progress, 5)}%` }}
          />
        </div>
      </div>

      {/* Subtle Top Gradient for Progress Bar */}
      <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/40 to-transparent z-10 pointer-events-none" />

      {/* Dark Bottom Gradient for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent z-10 pointer-events-none" />

      {/* Audio Mute/Unmute Quick Toggle (Top Right) */}
      <button
        type="button"
        onClick={toggleMute}
        aria-label={isMuted ? "Unmute video" : "Mute video"}
        className="absolute top-8 right-4 z-20 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/90 hover:bg-black/60 transition opacity-0 group-hover:opacity-100"
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
      </button>

      {/* Card Bottom Meta */}
      <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 z-20 flex items-end justify-between">
        <div>
          {/* Author Name */}
          <h3 className="text-lg sm:text-xl font-medium text-white tracking-tight leading-snug drop-shadow-sm">
            {story.name}
          </h3>
          {/* Car Model Info */}
          <p className="text-xs sm:text-sm text-white/80 font-normal mt-0.5 tracking-tight">
            {story.vehicle}
          </p>
        </div>

        {/* Play / Pause Indicator Button */}
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause video" : "Play video"}
          className="w-8 h-8 flex items-center justify-center text-white/90 hover:text-white transition active:scale-90"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-white stroke-none" />
          ) : (
            <Play className="w-5 h-5 fill-white stroke-none translate-x-0.5" />
          )}
        </button>
      </div>
    </div>
  );
};

export const WhatTheySaidSection = () => {
  const [scrollIndex, setScrollIndex] = useState(0);

  const handlePrev = () => {
    setScrollIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setScrollIndex((prev) => Math.min(STORIES.length - 1, prev + 1));
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Section Header with Title & Standalone Arrows */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-gray-900 tracking-[-0.055em]">
          What They Said
        </h2>

        {/* Standalone Carousel Arrows */}
        <div className="flex items-center gap-4">
          <button
            onClick={handlePrev}
            aria-label="Previous story"
            className="text-gray-600 hover:text-black transition p-1 active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none"
          >
            <ArrowLeft className="w-5 h-5 stroke-[1.75]" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next story"
            className="text-gray-600 hover:text-black transition p-1 active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none"
          >
            <ArrowRight className="w-5 h-5 stroke-[1.75]" />
          </button>
        </div>
      </div>

      {/* 3 Story Cards Grid with Reduced Gap */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-2.5 lg:gap-3">
        {STORIES.map((story, index) => (
          <StoryCard key={story.id} story={story} index={index} />
        ))}
      </div>
    </section>
  );
};
