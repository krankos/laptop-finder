'use client';

import { cn } from '@/lib/utils';

export const ProductSkeleton = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex flex-col gap-2 w-full", className)}>
      <div className="animate-pulse rounded-lg bg-muted-foreground/20 aspect-square w-full max-w-[200px]" />
      <div className="animate-pulse rounded-lg h-4 bg-muted-foreground/20 w-3/4" />
      <div className="animate-pulse rounded-lg h-5 bg-muted-foreground/20 w-1/2" />
    </div>
  );
};

export const ProductGridSkeleton = ({ count = 4 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-[500px]">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
};

export const ProductSearchSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 w-full max-w-[500px]">
      <div className="flex flex-col gap-2 w-full">
        <div className="animate-pulse rounded-lg h-8 bg-muted-foreground/20 w-full" />
        <div className="animate-pulse rounded-lg h-4 bg-muted-foreground/20 w-2/3" />
      </div>
      
      <ProductGridSkeleton count={4} />
    </div>
  );
};

export const ProductDetailSkeleton = () => {
  return (
    <div className="flex flex-col md:flex-row gap-4 w-full max-w-[500px] p-4 rounded-xl border">
      <div className="animate-pulse rounded-lg bg-muted-foreground/20 aspect-square w-full max-w-[200px]" />
      <div className="flex flex-col gap-3 flex-1">
        <div className="animate-pulse rounded-lg h-6 bg-muted-foreground/20 w-3/4" />
        <div className="animate-pulse rounded-lg h-8 bg-muted-foreground/20 w-1/2" />
        <div className="animate-pulse rounded-lg h-4 bg-muted-foreground/20 w-full" />
        <div className="animate-pulse rounded-lg h-4 bg-muted-foreground/20 w-full" />
        <div className="animate-pulse rounded-lg h-4 bg-muted-foreground/20 w-3/4" />
      </div>
    </div>
  );
};