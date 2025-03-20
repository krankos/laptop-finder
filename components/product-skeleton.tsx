'use client';

import { cn } from '@/lib/utils';
import { CheckCircle2, InfoIcon } from 'lucide-react';

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

// Also update the skeletons to match the subtle design
export const ProductSearchSkeleton = () => {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-background w-full max-w-[400px]">
      <div className="animate-pulse rounded-full h-5 w-5 bg-muted-foreground/20" />
      <div className="flex-1">
        <div className="animate-pulse rounded-lg h-4 bg-muted-foreground/20 w-3/4 mb-1" />
        <div className="animate-pulse rounded-lg h-3 bg-muted-foreground/20 w-1/2" />
      </div>
    </div>
  );
};

// Update product detail skeleton to match
export const ProductDetailSkeleton = ProductSearchSkeleton;

// Updated ProductSearchResult to only show meaningful results
export function ProductSearchResult({ 
  result,
  toolName 
}: { 
  result: any,
  toolName?: string
}) {
  // Check if we have meaningful results to show
  const totalProducts = result?.totalProducts || (Array.isArray(result) ? result.length : 0);
  const hasValidResult = totalProducts > 0 || (result && typeof result === 'object' && Object.keys(result).length > 0);
  
  // If there's no meaningful result, don't render anything
  if (!hasValidResult) {
    return null;
  }
  
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-background w-full max-w-[400px]">
      {totalProducts > 0 ? (
        <CheckCircle2 className="text-green-500 shrink-0" size={20} />
      ) : (
        <InfoIcon className="text-blue-500 shrink-0" size={20} />
      )}
      
      <div className="flex-1">
        <p className="text-sm font-medium">
          {totalProducts > 0 
            ? `Found ${totalProducts} product${totalProducts !== 1 ? 's' : ''}`
            : "No products match your criteria"}
        </p>
        
        <a 
          href="https://www.tunisianet.com.tn/301-pc-portable-tunisie" 
          target="_blank"
          rel="noopener noreferrer" 
          className="text-xs text-blue-600 hover:underline mt-0.5 inline-block"
        >
          Browse on TunisiaNet →
        </a>
      </div>
    </div>
  );
}