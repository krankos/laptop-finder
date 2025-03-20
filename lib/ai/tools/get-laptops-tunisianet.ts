import { tool } from "ai";
import { z } from "zod";
import * as cheerio from "cheerio"
import { buildFilterUrl } from "./urlBuilder";

// Retry configuration for fetch
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

// Modern fetch configuration
const fetchConfig = {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Cache-Control": "max-age=0",
  },
};

// Add this mapping at the top of the file
const LAPTOP_CATEGORY_URLS = {
  consumer: "https://www.tunisianet.com.tn/301-pc-portable-tunisie",
  gaming: "https://www.tunisianet.com.tn/681-pc-portable-gamer",
  pro: "https://www.tunisianet.com.tn/703-pc-portable-pro"
};

/**
 * Fetch with retry functionality using native fetch
 */
async function fetchWithRetry(url: string | URL | Request, options: { headers?: Record<string, string> } = {}, retries = 0) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: { ...fetchConfig.headers, ...options.headers },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return response;
  } catch (error) {
    if (retries < MAX_RETRIES) {
      console.log(
        `Attempt ${retries + 1} failed. Retrying in ${
          RETRY_DELAY / 1000
        } seconds...`
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, options, retries + 1);
    }
    throw error;
  }
}

/**
 * Scrapes product data
 */
async function scrapeProducts(baseUrl: string, filterParams = {}) {
  try {
    // Build URL with filters
    const url = buildFilterUrl(baseUrl, filterParams);
    console.log("Fetching data from:", url);

    // Fetch the page
    const response = await fetchWithRetry(url);
    const html = await response.text();

    // Parse with cheerio
    const $ = cheerio.load(html);

    // Data structure
    const scraperData: {
      totalProducts: number;
      totalPages: number;
      filters: { [key: string]: Array<{ value: string; count: number }> };
      products: Array<{ name: string; price: string; imageUrl?: string; productUrl?: string }>;
    } = {
      totalProducts: 0,
      totalPages: 0,
      filters: {},
      products: [],
    };

    // Extract total number of products
    const productCountText = $(".total-products p").text().trim();
    const productCountMatch = productCountText.match(/(\d+)\s+produits/i);
    if (productCountMatch && productCountMatch[1]) {
      scraperData.totalProducts = parseInt(productCountMatch[1], 10);
    }

    // Extract number of pages
    const paginationLinks = $(".page-list li").length;
    if (paginationLinks > 0) {
      const lastPageText = $(".page-list li:last-child a").text().trim();
      if (lastPageText && !isNaN(parseInt(lastPageText, 10))) {
        scraperData.totalPages = parseInt(lastPageText, 10);
      } else {
        scraperData.totalPages = paginationLinks;
      }
    }

    // Extract filters
    $(".af_filter").each((index, filterElement) => {
      const filterTitle = $(filterElement).find(".af_subtitle").text().trim();
      if (filterTitle) {
        const filterValues: { value: string; count: number; }[] = [];

        $(filterElement)
          .find(".af_filter_content li")
          .each((i, valueElement) => {
            const value = $(valueElement).find("label .name").text().trim();
            const countElement = $(valueElement).find("label .count");
            let count = 0;

            if (countElement.length > 0) {
              const countText = countElement.text().trim();
              const countMatch = countText.match(/(\d+)/);
              if (countMatch && countMatch[1]) {
                count = parseInt(countMatch[1], 10);
              }
            }

            if (value) {
              filterValues.push({
                value: value,
                count: count,
              });
            }
          });

        if (filterValues.length > 0) {
          scraperData.filters[filterTitle] = filterValues;
        }
      }
    });

    // Find products
    $(".product-miniature").each((index, element) => {
      const name = $(element).find(".product-title a").text().trim();
      const priceText = $(element).find(".price").text().trim();
      let price = priceText.replace(/[^\d.,]/g, "").trim();

      if (price.length > 4) {
        const halfLength = Math.floor(price.length / 2);
        const firstHalf = price.substring(0, halfLength);
        const secondHalf = price.substring(halfLength);

        if (price.indexOf(firstHalf, halfLength) !== -1) {
          price = firstHalf;
        }
      }

      const imageUrl = $(element).find(".product-thumbnail img").attr("src");
      const productUrl = $(element).find(".product-title a").attr("href");

      scraperData.products.push({
        name,
        price,
        imageUrl,
        productUrl,
      });
    });

    console.log(`Found ${scraperData.products.length} products on this page`);
    return scraperData;
  } catch (error) {
    console.error("Error scraping products:", error instanceof Error ? error.message : String(error));
    return null;
  }
}

/**
 * Helper function to build a search URL
 */
function buildSearchUrl(query: string, { orderby = "price", orderway = "asc" } = {}) {
  const url = new URL("https://www.tunisianet.com.tn/recherche");

  url.searchParams.append("controller", "search");
  url.searchParams.append("s", query);

  if (orderby) url.searchParams.append("orderby", orderby);
  if (orderway) url.searchParams.append("orderway", orderway);

  return url.toString();
}

/**
 * Helper function to format filters for URL
 */
function formatFiltersForUrl(filters: { [s: string]: unknown; } | ArrayLike<unknown>) {
  const formattedFilters: { [key: string]: unknown } = {};

  Object.entries(filters).forEach(([key, value]) => {
    // Format the key
    const formattedKey = key
      .toLowerCase()
      .replace(/\s+/g, "-")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9-]/g, "-");

    // Format the value
    let formattedValue;
    if (typeof value === "string") {
      formattedValue = value
        .toLowerCase()
        .replace(/\s+/g, "-")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9-]/g, "-");
    } else {
      formattedValue = value;
    }

    formattedFilters[formattedKey] = formattedValue;
  });

  return formattedFilters;
}

// Define self-contained tools for the agent

export const searchProducts = tool({
  description: "Search for products using a keyword query",
  parameters: z.object({
    query: z.string().describe("The search term to find products"),
    orderby: z
      .string()
      .optional()
      .default("price")
      .describe("Sort criterion: price, position, name, quantity"),
    orderway: z
      .string()
      .optional()
      .default("asc")
      .describe("Sort direction: asc or desc"),
  }),
  execute: async ({ query, orderby, orderway }) => {
    console.log(`[TOOL] searchProducts called with query: "${query}", orderby: ${orderby}, orderway: ${orderway}`);
    const searchUrl = buildSearchUrl(query, { orderby, orderway });
    console.log(`[TOOL] Fetching search results from: ${searchUrl}`);
    const results = await scrapeProducts(searchUrl, {});
    console.log(`[TOOL] searchProducts found ${results?.products?.length || 0} products`);
    return results;
  },
});

export const getFilters = tool({
  description:
    "Get valid filter options from search results or category page results",
  parameters: z.object({
    searchResults: z
      .any()
      .describe("Search results object from searchProducts"),
    onlyWithProducts: z
      .boolean()
      .optional()
      .default(true)
      .describe("If true, only return filters with product count > 0"),
  }),
  execute: ({ searchResults, onlyWithProducts }) => {
    console.log(`[TOOL] getFilters called with onlyWithProducts: ${onlyWithProducts}`);
    if (!searchResults || !searchResults.filters) {
      console.log(`[TOOL] getFilters found no filters in search results`);
      return {};
    }

    if (!onlyWithProducts) {
      const filterCount = Object.keys(searchResults.filters).length;
      console.log(`[TOOL] getFilters returning all ${filterCount} filter categories`);
      return searchResults.filters;
    }

    // Return only filters with product counts > 0
    const validFilters: Record<string, Array<{ value: string; count: number }>> = {};
    Object.entries(searchResults.filters).forEach(([category, values]) => {
      const validValues = (values as Array<{ value: string; count: number }>).filter((item) => item.count > 0);
      if (validValues.length > 0) {
        validFilters[category] = validValues;
      }
    });

    console.log(`[TOOL] getFilters returning ${Object.keys(validFilters).length} filter categories with products > 0`);
    return validFilters;
  },
});

// Fix fetchCategoryFilters to return an object with simpler structure
export const fetchCategoryFilters = tool({
  description: "Fetch available filters for a laptop category",
  parameters: z.object({
    laptopType: z
      .enum(["consumer", "gaming", "pro"])
      .default("consumer")
      .describe("Type of laptop category to fetch filters for (consumer, gaming, or pro)"),
  }),
  execute: async ({ laptopType }) => {
    const categoryUrl = LAPTOP_CATEGORY_URLS[laptopType];
    console.log(`[TOOL] fetchCategoryFilters called for ${laptopType} laptops: ${categoryUrl}`);
    console.log(`[TOOL] Fetching filters from category page`);
    const pageData = await scrapeProducts(categoryUrl, {});
    
    // Filter out categories with count 0
    const validFilters: Record<string, Array<{ value: string; count: number }>> = {};
    if (pageData && pageData.filters) {
      Object.entries(pageData.filters).forEach(([category, values]) => {
        const validValues = values.filter((item) => item.count > 0);
        if (validValues.length > 0) {
          validFilters[category] = validValues;
        }
      });
    }
    
    const filterCategories = Object.keys(validFilters).length;
    console.log(`[TOOL] fetchCategoryFilters found ${filterCategories} filter categories with products > 0`);
    
    // Include the category URL in the response so it can be used by other tools
    return {
      categoryUrl,
      laptopType,
      filters: validFilters
    };
  },
});

export const applyFilters = tool({
  description: "Apply filters to a laptop category",
  parameters: z.object({
    laptopType: z
      .enum(["consumer", "gaming", "pro"])
      .optional()
      .default("consumer")
      .describe("Type of laptop category (consumer, gaming, or pro)"),
    filters: z
      .string()
      .describe("JSON string of key-value pairs for filters (e.g., '{\"Prix\": \"1000-2000\"}')"),
    order: z
      .enum([
        "product.price.desc", 
        "product.price.asc", 
      ])
      .optional()
      .default("product.price.desc")
      .describe("Sort order for results (defaults to price high to low)"),
    allPages: z
      .boolean()
      .optional()
      .default(false)
      .describe("Whether to fetch all pages"),
  }),
  execute: async ({ laptopType, filters, order, allPages }) => {
    const baseUrl = LAPTOP_CATEGORY_URLS[laptopType];
    console.log(`[TOOL] applyFilters called for ${laptopType} laptops: ${baseUrl}`);
    console.log(`[TOOL] - filters: ${filters}`);
    console.log(`[TOOL] - order: ${order}`);
    
    // Parse the filters string into an object
    let processedFilters;
    try {
      processedFilters = JSON.parse(filters);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      console.error(`[TOOL] Error parsing filters string: ${errorMessage}`);
      return { error: "Invalid filter format" };
    }
    
    const formattedFilters = formatFiltersForUrl(processedFilters);
    console.log(`[TOOL] Formatted filters: ${JSON.stringify(formattedFilters)}`);

    // Add order parameter to filters
    if (order) {
      formattedFilters.order = order;
    }

    if (!allPages) {
      console.log(`[TOOL] Fetching first page only with applied filters`);
      const results = await scrapeProducts(baseUrl, formattedFilters);
      console.log(
        `[TOOL] applyFilters found ${results?.products?.length || 0} products`
      );
      return {
        ...results,
        categoryUrl: baseUrl,
        laptopType
      };
    } else {
      console.log(`[TOOL] Fetching all pages with applied filters`);
      // Get first page
      const firstPageData = await scrapeProducts(baseUrl, formattedFilters);

      if (
        !firstPageData ||
        !firstPageData.totalPages ||
        firstPageData.totalPages <= 1
      ) {
        console.log(`[TOOL] Only one page found, returning results`);
        return {
          ...firstPageData,
          categoryUrl: baseUrl,
          laptopType
        };
      }

      // Store combined results
      const allProducts = {
        totalProducts: firstPageData.totalProducts,
        totalPages: firstPageData.totalPages,
        filters: firstPageData.filters,
        products: [...firstPageData.products],
      };

      console.log(
        `[TOOL] Found ${firstPageData.totalPages} total pages, fetching remaining pages...`
      );
      // Fetch remaining pages
      for (let page = 2; page <= firstPageData.totalPages; page++) {
        console.log(
          `[TOOL] Fetching page ${page} of ${firstPageData.totalPages}`
        );
        const pageFilters = { ...formattedFilters, page };
        const pageData = await scrapeProducts(baseUrl, pageFilters);

        if (pageData && pageData.products) {
          allProducts.products = [
            ...allProducts.products,
            ...pageData.products,
          ];
          console.log(
            `[TOOL] Added ${pageData.products.length} products from page ${page}`
          );
        }

        // Add delay between requests
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      console.log(
        `[TOOL] applyFilters completed with ${allProducts.products.length} total products across all pages`
      );
      return {
        ...allProducts,
        categoryUrl: baseUrl,
        laptopType
      };
    }
  },
});

export const getProductDetails = tool({
  description: "Get detailed information about a specific product",
  parameters: z.object({
    productUrl: z.string().url().describe("URL of the product page"),
  }),
  execute: async ({ productUrl }) => {
    console.log(`[TOOL] getProductDetails called for product: ${productUrl}`);
    try {
      console.log(`[TOOL] Fetching detailed product information...`);
      const response = await fetchWithRetry(productUrl);
      const html = await response.text();
      const $ = cheerio.load(html);

      // Extract product information
      const productDetails = {
        url: productUrl,
        name: $("h1.product-title").text().trim(),
        price: $(".current-price").text().trim(),
        description: $("#description").text().trim(),
        images: [] as string[],
        specifications: {} as Record<string, string>,
        availability: $(".product-availability").text().trim(),
      };

      // Extract images
      $(".product-images img").each((i, img) => {
        const imgUrl = $(img).attr("src");
        if (imgUrl) productDetails.images.push(imgUrl);
      });

      // Extract specifications
      $("#product-details .product-features li").each((i, li) => {
        const label = $(li).find(".feature-name").text().trim();
        const value = $(li).find(".feature-value").text().trim();
        if (label && value) {
          productDetails.specifications[label] = value;
        }
      });

      console.log(`[TOOL] getProductDetails completed for "${productDetails.name}"`);
      console.log(`[TOOL] Found ${Object.keys(productDetails.specifications).length} specifications`);
      return productDetails;
    } catch (error) {
      console.error(`[TOOL] Error fetching product details: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  },
});

export const getAllProducts = tool({
  description: "Get all products from a laptop category",
  parameters: z.object({
    laptopType: z
      .enum(["consumer", "gaming", "pro"])
      .default("consumer")
      .describe("Type of laptop category (consumer, gaming, or pro)"),
    allPages: z
      .boolean()
      .optional()
      .default(false)
      .describe("Whether to fetch all pages"),
  }),
  execute: async ({ laptopType, allPages }) => {
    const categoryUrl = LAPTOP_CATEGORY_URLS[laptopType];
    console.log(`[TOOL] getAllProducts called for ${laptopType} laptops: ${categoryUrl}`);
    console.log(`[TOOL] - allPages: ${allPages}`);
    
    // Fully self-contained implementation that doesn't rely on applyFilters tool
    if (!allPages) {
      console.log(`[TOOL] Fetching only first page of products`);
      const results = await scrapeProducts(categoryUrl, {});
      console.log(`[TOOL] getAllProducts found ${results?.products?.length || 0} products on first page`);
      console.log(`[TOOL] Total products in category: ${results?.totalProducts || 'unknown'}`);
      console.log(`[TOOL] Total pages in category: ${results?.totalPages || 1}`);
      return {
        ...results,
        categoryUrl,
        laptopType
      };
    } else {
      console.log(`[TOOL] Fetching all pages of products`);
      // Get first page
      const firstPageData = await scrapeProducts(categoryUrl, {});

      if (
        !firstPageData ||
        !firstPageData.totalPages ||
        firstPageData.totalPages <= 1
      ) {
        console.log(`[TOOL] Only one page found, returning results`);
        return {
          ...firstPageData,
          categoryUrl,
          laptopType
        };
      }

      // Store combined results
      const allProducts = {
        totalProducts: firstPageData.totalProducts,
        totalPages: firstPageData.totalPages,
        filters: firstPageData.filters,
        products: [...firstPageData.products],
      };

      console.log(`[TOOL] Found ${firstPageData.totalPages} total pages, fetching remaining pages...`);
      // Fetch remaining pages
      for (let page = 2; page <= firstPageData.totalPages; page++) {
        console.log(`[TOOL] Fetching page ${page} of ${firstPageData.totalPages}`);
        const pageData = await scrapeProducts(categoryUrl, { page });

        if (pageData && pageData.products) {
          allProducts.products = [
            ...allProducts.products,
            ...pageData.products,
          ];
          console.log(`[TOOL] Added ${pageData.products.length} products from page ${page}`);
        }

        // Add delay between requests
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      console.log(`[TOOL] getAllProducts completed with ${allProducts.products.length} total products across all pages`);
      return {
        ...allProducts,
        categoryUrl,
        laptopType
      };
    }
  },
});