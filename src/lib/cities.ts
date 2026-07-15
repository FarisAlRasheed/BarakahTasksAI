/**
 * Saudi Arabian cities list.
 * nameAr: Arabic display name (used in the UI dropdown)
 * nameEn: English name (required by the Aladhan API)
 */

export interface City {
  nameAr: string;
  nameEn: string;
}

export const SAUDI_CITIES: City[] = [
  { nameAr: "الرياض", nameEn: "Riyadh" },
  { nameAr: "جدة", nameEn: "Jeddah" },
  { nameAr: "مكة المكرمة", nameEn: "Makkah" },
  { nameAr: "المدينة المنورة", nameEn: "Madinah" },
  { nameAr: "الدمام", nameEn: "Dammam" },
  { nameAr: "الخبر", nameEn: "Khobar" },
  { nameAr: "الظهران", nameEn: "Dhahran" },
  { nameAr: "أبها", nameEn: "Abha" },
  { nameAr: "تبوك", nameEn: "Tabuk" },
  { nameAr: "حائل", nameEn: "Hail" },
  { nameAr: "الطائف", nameEn: "Taif" },
  { nameAr: "بريدة", nameEn: "Buraydah" },
  { nameAr: "نجران", nameEn: "Najran" },
  { nameAr: "جازان", nameEn: "Jazan" },
  { nameAr: "ينبع", nameEn: "Yanbu" },
];

/**
 * Validates that a city name (Arabic) is in our allowed list.
 * Returns the matching City object, or undefined if invalid.
 */
export function findCity(nameAr: string): City | undefined {
  return SAUDI_CITIES.find((c) => c.nameAr === nameAr);
}
