'use client';

import { cn } from '@/lib/utils';
import { CheckCircle2, InfoIcon, Filter, Laptop, Search } from 'lucide-react';

type ProductToolResultProps = {
  result?: any;
  toolName?: string;
  loading?: boolean;
};

export function ProductToolResult({ result, toolName, loading = false }: ProductToolResultProps) {
  if (loading) {
    return <ProductToolSkeleton toolName={toolName} />;
  }
  
  // Don't show any result for fetchCategoryFilters tool
  if (toolName === 'fetchCategoryFilters') {
    return null;
  }
  
  // Return null for empty results
  if (!result) return null;
  
  // Extract URLs from result (with fallbacks)
  const laptopBaseUrl = "https://www.tunisianet.com.tn/301-pc-portable-tunisie";
  const productUrl = result?.productUrl || laptopBaseUrl;
  
  // For product detail tool
  if (toolName === 'getProductDetails') {
    const hasProduct = result && typeof result === 'object' && Object.keys(result).length > 0;
    if (!hasProduct) return null;
    
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-background w-full max-w-[400px]">
        <Laptop className="text-blue-500 shrink-0" size={20} />
        <div className="flex-1">
          <p className="text-sm font-medium">Product details retrieved</p>
          <ProductLink url={productUrl} />
        </div>
      </div>
    );
  }
  
  // Default case for product search tools
  const totalProducts = result?.totalProducts || (Array.isArray(result) ? result.length : 0);
  const hasValidResult = totalProducts > 0 || (typeof result === 'object' && Object.keys(result).length > 0);
  
  if (!hasValidResult) return null;
  
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
            ? `Found ${totalProducts} laptop${totalProducts !== 1 ? 's' : ''}`
            : "No laptops match your criteria"}
        </p>
        
        <ProductLink url={result?.categoryUrl || laptopBaseUrl} />
      </div>
    </div>
  );
}

// Helper component for consistent product links
function ProductLink({ url }: { url: string }) {
  return (
    <a 
      href={url}
      target="_blank"
      rel="noopener noreferrer" 
      className="text-xs text-blue-600 hover:underline mt-0.5 inline-block"
    >
      Browse on TunisiaNet →
    </a>
  );
}

// Skeleton that adapts to the tool type
export function ProductToolSkeleton({ toolName }: { toolName?: string }) {
  // Default values
  let loadingMessage = "Looking for products...";
  let secondaryMessage = "This might take a moment";
  let icon = <Search className="animate-pulse text-blue-500 shrink-0" size={20} />;
  
  // Set specific messages based on tool type
  if (toolName === 'fetchCategoryFilters') {
    loadingMessage = "Finding available filters...";
    secondaryMessage = "Loading brands, specs, and price ranges";
    icon = <Filter className="animate-pulse text-blue-500 shrink-0" size={20} />;
  } else if (toolName === 'applyFilters') {
    loadingMessage = "Applying your filters...";
    secondaryMessage = "Finding laptops that match your criteria";
    icon = <Filter className="animate-pulse text-blue-500 shrink-0" size={20} />;
  } else if (toolName === 'getProductDetails') {
    loadingMessage = "Getting product details...";
    secondaryMessage = "Retrieving specifications and pricing";
    icon = <Laptop className="animate-pulse text-blue-500 shrink-0" size={20} />;
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-background w-full max-w-[400px]">
      {icon}
      <div className="flex-1">
        <p className="text-sm font-medium">{loadingMessage}</p>
        <p className="text-xs text-muted-foreground">{secondaryMessage}</p>
      </div>
    </div>
  );
}