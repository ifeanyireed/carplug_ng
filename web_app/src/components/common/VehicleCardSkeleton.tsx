"use client";

import React from "react";

interface VehicleGridSkeletonProps {
  count?: number;
  className?: string;
}

export const VehicleCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-200/80 shadow-2xs flex flex-col animate-pulse">
      {/* Card Image Area Skeleton */}
      <div className="relative w-full aspect-[16/10] bg-gray-200/80 overflow-hidden">
        {/* Shimmer effect highlight */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        
        {/* Top badge placeholder */}
        <div className="absolute top-3 left-3 w-20 h-5 bg-gray-300/80 rounded-full" />
        
        {/* Heart button placeholder */}
        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-300/80" />
        
        {/* Carousel pagination dots placeholder */}
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300/60" />
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300/60" />
        </div>
      </div>

      {/* Card Body Skeleton */}
      <div className="p-4 sm:p-4.5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Title & Year Placeholder */}
          <div className="h-5 bg-gray-200 rounded-md w-4/5 mb-2" />
          <div className="h-3.5 bg-gray-150 rounded-md w-2/5" />

          {/* Specs Pill Row Placeholder */}
          <div className="flex items-center flex-wrap gap-2 mt-3.5">
            <div className="h-3.5 bg-gray-200 rounded w-16" />
            <div className="w-1 h-1 rounded-full bg-gray-300" />
            <div className="h-3.5 bg-gray-200 rounded w-20" />
            <div className="w-1 h-1 rounded-full bg-gray-300" />
            <div className="h-3.5 bg-gray-200 rounded w-16" />
          </div>
        </div>

        {/* Pricing & CTA Divider Placeholder */}
        <div className="pt-3.5 border-t border-gray-100 flex items-center justify-between">
          <div className="h-5 bg-gray-200 rounded-md w-24" />
          <div className="h-4 bg-gray-200 rounded-md w-20" />
        </div>
      </div>
    </div>
  );
};

export const VehicleGridSkeleton = ({ count = 6, className = "" }: VehicleGridSkeletonProps) => {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 ${className}`}
      aria-label="Loading vehicle inventory"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <VehicleCardSkeleton key={idx} />
      ))}
    </div>
  );
};
