// Define types for all the possible filter parameters
interface FilterParams {
  prix?: string;                   // Price range (e.g., "4113-8160")
  reseau?: string;                 // Network (e.g., "wifi-ethernet-bluetooth")
  memoire?: string;                // Memory (e.g., "16-go")
  fabricants?: string;             // Manufacturers (e.g., "apple")
  processeur?: string;             // Processor type
  "disque-dur"?: string;           // Hard drive (e.g., "1-to-ssd")
  "carte-graphique"?: string;      // Graphics card (e.g., "graphique-integree")
  "taille-ecran"?: string;         // Screen size (e.g., "14")
  "ecran-tactile"?: string;        // Touch screen (e.g., "non")
  "systeme-d-exploitation"?: string; // Operating system (e.g., "windows-11")
  garantie?: string;               // Warranty (e.g., "1-an")
  couleur?: string;                // Color (e.g., "noir")
  "taux-de-rafraichissement"?: string; // Refresh rate
  "ref-carte-graphique"?: string;  // Graphics card reference (e.g., "intel-iris-xe")
  gamer?: string;                  // Gaming laptop flag
  page?: number | string;          // Page number for pagination
  order?: string;                  // Sort order (e.g., "product.price.asc")
  [key: string]: string | number | undefined; // Allow any other string keys
}

/**
 * Builds a URL with filter parameters for the Tunisianet product catalog
 * @param baseUrl - The base URL for the product category
 * @param filters - Object containing filter parameters
 * @returns Full URL with filter parameters
 * 
 * @example
 * // Basic filtering
 * const url = buildFilterUrl("https://www.tunisianet.com.tn/703-pc-portable-pro", {
 *   prix: "4113-8160",
 *   memoire: "16-go",
 *   "ref-carte-graphique": "intel-iris-xe",
 *   order: "product.price.asc"
 * });
 * 
 * // With pagination
 * const url = buildFilterUrl("https://www.tunisianet.com.tn/703-pc-portable-pro", {
 *   page: 2,
 *   order: "product.price.asc"
 * });
 */
export function buildFilterUrl(baseUrl: string, filters: FilterParams): string {
  const url = new URL(baseUrl);
  
  // Add each filter parameter to the URL
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, value.toString());
    }
  });
  
  return url.toString();
}

/**
 * Converts command line filter arguments to a FilterParams object
 * @param filterArgs - Array of filter arguments in format "key:value"
 * @returns FilterParams object
 * 
 * @example
 * const filters = parseFilterArgs(["prix:4113-8160", "memoire:16-go", "page:2"]);
 */
export function parseFilterArgs(filterArgs: string[]): FilterParams {
  const filters: FilterParams = {};
  
  filterArgs.forEach(arg => {
    const [key, value] = arg.split(':');
    if (key && value) {
      // Convert page parameter to number if it's numeric
      if (key === 'page' && !isNaN(Number(value))) {
        filters[key] = Number(value);
      } else {
        filters[key] = value;
      }
    }
  });
  
  return filters;
}