import type { InventoryItem } from "@/types/inventory";
import type { ProductStatus } from "@/types/product";

export interface CsvRowValidation {
  rowIndex: number;
  raw: Record<string, string>;
  parsed?: Partial<InventoryItem>;
  isValid: boolean;
  errors: string[];
}

export interface CsvParseResult {
  totalRows: number;
  validCount: number;
  errorCount: number;
  rows: CsvRowValidation[];
  parseTimeMs: number;
}

/**
 * Escapes a single CSV value according to standard CSV spec.
 */
export function escapeCsvField(val: string | number | boolean | undefined | null): string {
  if (val === undefined || val === null) return '""';
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Exports inventory items to CSV format.
 */
export function exportInventoryToCSV(items: InventoryItem[], filename = "inventory_export.csv") {
  const headers = [
    "ID",
    "SKU",
    "Name",
    "Category",
    "Price",
    "Stock",
    "LowStockThreshold",
    "Status",
    "IsVariant",
    "ParentName",
    "UpdatedAt",
  ];

  const rows = items.map((item) => [
    escapeCsvField(item.id),
    escapeCsvField(item.sku),
    escapeCsvField(item.name),
    escapeCsvField(item.category),
    escapeCsvField(item.price),
    escapeCsvField(item.stock),
    escapeCsvField(item.lowStockThreshold),
    escapeCsvField(item.status),
    escapeCsvField(item.isVariant),
    escapeCsvField(item.parentName || ""),
    escapeCsvField(item.updatedAt),
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parses raw CSV line handling quotes and commas.
 */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Parses CSV string up to 5,000+ rows in <100ms and validates each row.
 */
export function parseAndValidateInventoryCSV(csvText: string): CsvParseResult {
  const startTime = performance.now();
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    return {
      totalRows: 0,
      validCount: 0,
      errorCount: 0,
      rows: [],
      parseTimeMs: 0,
    };
  }

  const rawHeaders = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ""));
  
  // Header aliases map
  const getHeaderIndex = (possibleNames: string[]): number => {
    return rawHeaders.findIndex((h) => possibleNames.includes(h));
  };

  const skuIdx = getHeaderIndex(["sku", "productsku", "itemsku", "code"]);
  const nameIdx = getHeaderIndex(["name", "productname", "itemname", "title"]);
  const categoryIdx = getHeaderIndex(["category", "cat", "department"]);
  const priceIdx = getHeaderIndex(["price", "unitprice", "cost"]);
  const stockIdx = getHeaderIndex(["stock", "stockqty", "quantity", "qty"]);
  const thresholdIdx = getHeaderIndex(["lowstockthreshold", "threshold", "lowstock", "minstock"]);
  const statusIdx = getHeaderIndex(["status", "state"]);
  const thumbnailIdx = getHeaderIndex(["thumbnail", "image", "img"]);

  const rows: CsvRowValidation[] = [];
  let validCount = 0;
  let errorCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const errors: string[] = [];

    const sku = skuIdx !== -1 ? cols[skuIdx] || "" : `SKU-IMP-${String(i).padStart(4, "0")}`;
    const name = nameIdx !== -1 ? cols[nameIdx] || "" : "";
    const category = categoryIdx !== -1 ? cols[categoryIdx] || "General" : "General";
    const rawPrice = priceIdx !== -1 ? cols[priceIdx] : "";
    const rawStock = stockIdx !== -1 ? cols[stockIdx] : "";
    const rawThreshold = thresholdIdx !== -1 ? cols[thresholdIdx] : "";
    const rawStatus = statusIdx !== -1 ? cols[statusIdx] : "";
    const thumbnail = thumbnailIdx !== -1 ? cols[thumbnailIdx] || "" : "";

    // Validation Rules
    if (!name && !sku) {
      errors.push("Missing SKU and Product Name");
    }

    let price = parseFloat(rawPrice);
    if (rawPrice === "" || isNaN(price)) {
      errors.push("Invalid or missing price (must be a number)");
      price = 0;
    } else if (price < 0) {
      errors.push("Price cannot be negative");
    }

    let stock = parseInt(rawStock, 10);
    if (rawStock === "" || isNaN(stock)) {
      errors.push("Invalid or missing stock quantity");
      stock = 0;
    } else if (stock < 0) {
      errors.push("Stock quantity cannot be negative");
    }

    let threshold = parseInt(rawThreshold, 10);
    if (isNaN(threshold) || threshold < 0) {
      threshold = 10; // Default fallback
    }

    let status: ProductStatus = "published";
    if (rawStatus) {
      const s = rawStatus.toLowerCase();
      if (s === "draft") status = "draft";
      else if (s === "out-of-stock" || s === "disabled" || s === "inactive") status = "out-of-stock";
      else if (s === "published" || s === "active") status = "published";
      else errors.push(`Unknown status '${rawStatus}' (expected: published, draft, out-of-stock)`);
    } else if (stock === 0) {
      status = "out-of-stock";
    }

    const isValid = errors.length === 0;
    if (isValid) validCount++;
    else errorCount++;

    const parsedItem: Partial<InventoryItem> = {
      id: `imp_${Date.now()}_${i}`,
      productId: `prod_imp_${i}`,
      isVariant: name.includes("-") || name.includes("/"),
      name: name || `Imported Item ${i}`,
      sku: sku || `SKU-IMP-${i}`,
      price: Math.round(price * 100) / 100,
      stock,
      lowStockThreshold: threshold,
      category,
      status,
      thumbnail: thumbnail || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&auto=format&fit=crop&q=80",
      updatedAt: new Date().toISOString(),
    };

    rows.push({
      rowIndex: i,
      raw: {
        sku,
        name,
        category,
        price: rawPrice,
        stock: rawStock,
        threshold: rawThreshold,
        status: rawStatus,
      },
      parsed: parsedItem,
      isValid,
      errors,
    });
  }

  const parseTimeMs = Math.round(performance.now() - startTime);

  return {
    totalRows: rows.length,
    validCount,
    errorCount,
    rows,
    parseTimeMs,
  };
}

/**
 * Generates sample CSV template for inventory imports.
 */
export function generateSampleInventoryCsv(): string {
  return [
    "SKU,Name,Category,Price,Stock,LowStockThreshold,Status",
    "SKU-SHIRT-001,Classic Cotton Shirt,Clothing,39.99,150,15,published",
    "SKU-JEANS-002,Slim Denim Jeans - Blue / 32,Clothing,69.99,45,10,published",
    "SKU-WATCH-003,Pro Chronograph Watch,Electronics,299.00,0,5,out-of-stock",
    "SKU-SHOES-004,Leather Running Shoes - Black / 42,Footwear,119.50,18,8,draft",
  ].join("\n");
}
