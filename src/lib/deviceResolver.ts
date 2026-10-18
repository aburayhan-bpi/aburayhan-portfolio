/**
 * Device Model Resolver
 * Detects specific smartphone, tablet, and PC models across Android, iOS, Windows, Mac, and Linux.
 */

// Popular Samsung Galaxy Model Code Map
const SAMSUNG_CODES: Record<string, string> = {
  // S24 Series
  "SM-S928": "Samsung Galaxy S24 Ultra",
  "SM-S926": "Samsung Galaxy S24+",
  "SM-S921": "Samsung Galaxy S24",
  // S23 Series
  "SM-S918": "Samsung Galaxy S23 Ultra",
  "SM-S916": "Samsung Galaxy S23+",
  "SM-S911": "Samsung Galaxy S23",
  // S22 Series
  "SM-S908": "Samsung Galaxy S22 Ultra",
  "SM-S906": "Samsung Galaxy S22+",
  "SM-S901": "Samsung Galaxy S22",
  // S21 Series
  "SM-G998": "Samsung Galaxy S21 Ultra",
  "SM-G996": "Samsung Galaxy S21+",
  "SM-G991": "Samsung Galaxy S21",
  "SM-G990": "Samsung Galaxy S21 FE",
  // S20 Series
  "SM-G988": "Samsung Galaxy S20 Ultra",
  "SM-G986": "Samsung Galaxy S20+",
  "SM-G981": "Samsung Galaxy S20",
  "SM-G781": "Samsung Galaxy S20 FE",
  // Z Fold / Flip
  "SM-F946": "Samsung Galaxy Z Fold 5",
  "SM-F731": "Samsung Galaxy Z Flip 5",
  "SM-F936": "Samsung Galaxy Z Fold 4",
  "SM-F721": "Samsung Galaxy Z Flip 4",
  // Popular A Series
  "SM-A546": "Samsung Galaxy A54 5G",
  "SM-A346": "Samsung Galaxy A34 5G",
  "SM-A536": "Samsung Galaxy A53 5G",
  "SM-A336": "Samsung Galaxy A33 5G",
  "SM-A528": "Samsung Galaxy A52s 5G",
  "SM-A525": "Samsung Galaxy A52",
  "SM-A146": "Samsung Galaxy A14 5G",
  "SM-A137": "Samsung Galaxy A13",
  "SM-A125": "Samsung Galaxy A12",
};

/**
 * Resolves iOS device model based on physical screen dimensions and pixel ratio.
 */
export function resolveAppleModel(
  width: number,
  height: number,
  pixelRatio: number,
  isTablet: boolean,
): string {
  if (isTablet) {
    return "Apple iPad";
  }

  const min = Math.min(width, height) * pixelRatio;
  const max = Math.max(width, height) * pixelRatio;

  // Exact resolution matching for modern iPhones
  if (min === 1290 && max === 2796) return "iPhone 15/16 Pro Max";
  if (min === 1179 && max === 2556) return "iPhone 15/16 Pro";
  if (min === 1170 && max === 2532) return "iPhone 13/14 / 12";
  if (min === 1284 && max === 2778) return "iPhone 13/14 Pro Max";
  if (min === 1080 && max === 2340) return "iPhone 12/13 mini";
  if (min === 828 && max === 1792) return "iPhone 11 / XR";
  if (min === 1125 && max === 2436) return "iPhone X / XS / 11 Pro";
  if (min === 1242 && max === 2688) return "iPhone XS Max / 11 Pro Max";
  if (min === 750 && max === 1334) return "iPhone SE (Gen 2/3)";

  return "Apple iPhone";
}

/**
 * Parses user agent string to extract specific Android hardware model,
 * Samsung model, Google Pixel, Xiaomi, OnePlus, or Mac/PC.
 */
export function extractDeviceModelFromUA(userAgent: string): string {
  if (!userAgent) return "Unknown Device";
  const ua = userAgent.trim();

  // 1. Apple iPhone / iPad / Mac
  if (/iPad/i.test(ua)) return "Apple iPad";
  if (/iPhone/i.test(ua)) return "Apple iPhone";
  if (/Macintosh|Mac OS X/i.test(ua) && !/iPhone|iPad/i.test(ua)) return "Apple Mac";

  // 2. Android Devices extraction
  if (/Android/i.test(ua)) {
    // Look for: Android <version>; <Model> Build or Android <version>; <Model>)
    const androidMatch = ua.match(/Android\s+[^;]+;\s*([^;)]+?)(?:\s+Build|\)|;)/i);
    if (androidMatch && androidMatch[1]) {
      let rawModel = androidMatch[1].trim();
      // Remove locale prefixes if present e.g. "en-us; SM-..."
      rawModel = rawModel.replace(/^[a-z]{2}(?:-[a-z]{2})?;\s*/i, "");

      // Check Samsung Code Map
      for (const [codePrefix, name] of Object.entries(SAMSUNG_CODES)) {
        if (rawModel.toUpperCase().includes(codePrefix)) {
          return name;
        }
      }

      // Check Samsung prefix
      if (/^SM-[A-Z0-9]+/i.test(rawModel)) {
        return `Samsung (${rawModel})`;
      }

      // Check Pixel
      if (/Pixel\s*[0-9a-z\s]+/i.test(rawModel)) {
        return `Google ${rawModel}`;
      }

      // Check Xiaomi / Redmi / POCO
      if (/Redmi|POCO|Xiaomi|MI\s/i.test(rawModel)) {
        return rawModel.startsWith("Xiaomi") ? rawModel : `Xiaomi ${rawModel}`;
      }

      // Check OnePlus
      if (/OnePlus|GM19|KB20|IN20/i.test(rawModel)) {
        return rawModel.startsWith("OnePlus") ? rawModel : `OnePlus ${rawModel}`;
      }

      // Check Realme / Oppo / Vivo
      if (/^RMX[0-9]+/i.test(rawModel)) return `Realme (${rawModel})`;
      if (/^CPH[0-9]+/i.test(rawModel)) return `Oppo (${rawModel})`;
      if (/^V[0-9]{4}/i.test(rawModel)) return `Vivo (${rawModel})`;

      // Return clean model if reasonable length
      if (rawModel.length > 1 && rawModel.length < 35 && !rawModel.includes("Linux")) {
        return rawModel;
      }
    }
    return "Android Device";
  }

  // 3. Windows PC
  if (/Windows NT 10\.0|Windows NT 11\.0/i.test(ua)) return "Windows PC";
  if (/Windows/i.test(ua)) return "Windows PC";

  // 4. Linux PC
  if (/Linux/i.test(ua) && !/Android/i.test(ua)) return "Linux PC";

  return "Desktop PC";
}

/**
 * High-level resolver combining client-supplied hints and user agent.
 */
export function resolveDeviceModel({
  userAgent = "",
  clientModel = "",
  screenWidth = 0,
  screenHeight = 0,
  devicePixelRatio = 1,
}: {
  userAgent?: string;
  clientModel?: string;
  screenWidth?: number;
  screenHeight?: number;
  devicePixelRatio?: number;
}): string {
  // If client hints already provided a clean hardware model
  if (clientModel && clientModel.trim().length > 0 && clientModel !== "Unknown") {
    // Check if it's a Samsung code
    for (const [codePrefix, name] of Object.entries(SAMSUNG_CODES)) {
      if (clientModel.toUpperCase().includes(codePrefix)) {
        return name;
      }
    }
    return clientModel.trim();
  }

  // Check if iOS and we have screen dimensions
  if (/iPhone|iPad/i.test(userAgent) && screenWidth > 0 && screenHeight > 0) {
    return resolveAppleModel(
      screenWidth,
      screenHeight,
      devicePixelRatio || 1,
      /iPad/i.test(userAgent),
    );
  }

  // Fallback to User-Agent parser
  return extractDeviceModelFromUA(userAgent);
}
