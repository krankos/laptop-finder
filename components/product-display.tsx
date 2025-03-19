'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

// Helper to extract just the laptop name from the full product name
function extractLaptopName(fullName) {
  if (!fullName) return '';
  // The laptop name is typically before the first slash
  return fullName.split('/')[0].trim();
}

export function ProductGrid({ 
  products = [], 
  className,
  showFilters = false
}: { 
  products: any[], 
  className?: string,
  showFilters?: boolean
}) {
  if (!products || products.length === 0) {
    return <div>No products found.</div>;
  }

  // Only show products when specifically requested with filters
  if (!showFilters && products.length > 1) {
    return (
      <div className="p-4 border rounded-lg bg-muted/30">
        <p>Found {products.length} products. Please use filters to narrow down your search results.</p>
      </div>
    );
  }

  // Display up to 5 products
  const displayProducts = products.slice(0, 5);
  const hasMoreProducts = products.length > 5;

  return (
    <>
      <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-4", className)}>
        {displayProducts.map((product, index) => (
          <div key={index} className="flex flex-col border rounded-lg overflow-hidden">
            <div className="relative aspect-square bg-muted">
              {product.imageUrl && (
                <Image 
                  src={product.imageUrl} 
                  alt={product.name || 'Product image'} 
                  fill 
                  className="object-contain p-2" 
                  sizes="(max-width: 768px) 100vw, 200px"
                />
              )}
            </div>
            <div className="p-3 flex flex-col gap-1">
              <h3 className="font-medium line-clamp-2">{extractLaptopName(product.name) || 'Product'}</h3>
              
              {/* Extract key specs using simple pattern matching */}
              <div className="text-sm text-muted-foreground mt-1 space-y-1">
                {/* CPU info */}
                {product.name?.match(/i\d-\w+|Ryzen \d \w+|Ultra \d/) && (
                  <p>
                    <span className="font-medium">CPU:</span> {product.name.match(/i\d-\w+|Ryzen \d \w+|Ultra \d/)[0]}
                  </p>
                )}
                
                {/* RAM */}
                {product.name?.match(/\d+ Go(?! SSD)/) && (
                  <p>
                    <span className="font-medium">RAM:</span> {product.name.match(/\d+ Go(?! SSD)/)[0]}
                  </p>
                )}
                
                {/* Storage */}
                {product.name?.match(/\d+ Go SSD/) && (
                  <p>
                    <span className="font-medium">Storage:</span> {product.name.match(/\d+ Go SSD/)[0]}
                  </p>
                )}
                
                {/* GPU if present */}
                {product.name?.match(/RTX \d+|GTX \d+/) && (
                  <p>
                    <span className="font-medium">GPU:</span> {product.name.match(/RTX \d+|GTX \d+/)[0]}
                  </p>
                )}
              </div>
              
              {product.price && (
                <p className="text-lg font-bold mt-2">{product.price} DT</p>
              )}
            </div>
          </div>
        ))}
      </div>
      {hasMoreProducts && (
        <div className="p-4 border rounded-lg bg-muted/30 mt-4">
          <p>There are more products available. Please use filters to narrow down your search results.</p>
        </div>
      )}
    </>
  );
}

export function ProductDetail({ product }: { product: any }) {
  if (!product) {
    return <div>Product details not available.</div>;
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 border rounded-lg p-4">
      <div className="relative aspect-square w-full max-w-[300px] bg-muted">
        {product.imageUrl && (
          <Image 
            src={product.imageUrl} 
            alt={product.name || 'Product image'} 
            fill 
            className="object-contain p-4" 
            sizes="(max-width: 768px) 100vw, 300px"
          />
        )}
      </div>
      <div className="flex flex-col gap-3 flex-1">
        {/* Show the laptop name in the heading */}
        <h2 className="text-xl font-semibold">{extractLaptopName(product.name)}</h2>
        {/* Show full product name for complete information */}
        <p className="text-sm text-muted-foreground">{product.name}</p>
        
        {product.price && <p className="text-2xl font-bold">{product.price} DT</p>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          {/* CPU info */}
          {product.name?.match(/i\d-\w+|Ryzen \d \w+|Ultra \d/) && (
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Processor</span>
              <span className="font-medium">{product.name.match(/i\d-\w+|Ryzen \d \w+|Ultra \d/)[0]}</span>
            </div>
          )}
          
          {/* RAM */}
          {product.name?.match(/\d+ Go(?! SSD)/) && (
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Memory</span>
              <span className="font-medium">{product.name.match(/\d+ Go(?! SSD)/)[0]}</span>
            </div>
          )}
          
          {/* Storage */}
          {product.name?.match(/\d+ Go SSD/) && (
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Storage</span>
              <span className="font-medium">{product.name.match(/\d+ Go SSD/)[0]}</span>
            </div>
          )}
          
          {/* GPU if present */}
          {product.name?.match(/RTX \d+|GTX \d+/) && (
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Graphics</span>
              <span className="font-medium">{product.name.match(/RTX \d+|GTX \d+/)[0]}</span>
            </div>
          )}
          
          {/* OS if present */}
          {product.name?.match(/Windows \d+( Pro)?/) && (
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Operating System</span>
              <span className="font-medium">{product.name.match(/Windows \d+( Pro)?/)[0]}</span>
            </div>
          )}
          
          {/* Color if present */}
          {product.name?.match(/(Bleu|Gold|Noir|Silver|Gris|Argent)/) && (
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Color</span>
              <span className="font-medium">{product.name.match(/(Bleu|Gold|Noir|Silver|Gris|Argent)/)[0]}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}