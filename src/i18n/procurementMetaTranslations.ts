import type { Lang } from "./index";

type L = Partial<Record<Lang, string>>;

export const PROCUREMENT_CATEGORY_TRANSLATIONS: Record<string, L> = {
  "Dairy Products": { hi: "डेयरी उत्पाद", mr: "डेअरी उत्पादने" },
  "Vegetables": { hi: "सब्जियाँ", mr: "भाज्या" },
  "Fruits": { hi: "फल", mr: "फळे" },
  "Grains & Cereals": { hi: "अनाज और दलिया", mr: "धान्य आणि तृणधान्य" },
  "Pulses & Legumes": { hi: "दाल और फलियाँ", mr: "डाळ आणि कडधान्ये" },
  "Masala & Seasonings": { hi: "मसाला और मसाले", mr: "मसाले आणि चवदारक" },
  "Oils & Fats": { hi: "तेल और वसा", mr: "तेल आणि चरबी" },
  "Bakery & Dessert Ingredients": { hi: "बेकरी और मिठाई सामग्री", mr: "बेकरी आणि मिष्टान्न साहित्य" },
  "Frozen & Processed Foods": { hi: "जमे और प्रसंस्कृत खाद्य", mr: "गोठवलेले आणि प्रक्रिया केलेले अन्न" },
  "Cooking Utensils": { hi: "खाना पकाने के बर्तन", mr: "स्वयंपाकाची भांडी" },
  "Serving Materials": { hi: "परोसने की सामग्री", mr: "सर्व्हिंग साहित्य" },
  "Packaging Materials": { hi: "पैकेजिंग सामग्री", mr: "पॅकेजिंग साहित्य" },
  "Cleaning & Hygiene": { hi: "सफाई और स्वच्छता", mr: "स्वच्छता आणि स्वच्छतेची काळजी" },
  "Waste Management": { hi: "कचरा प्रबंधन", mr: "कचरा व्यवस्थापन" },
  "Gas & Fuel": { hi: "गैस और ईंधन", mr: "गॅस आणि इंधन" },
  "Beverages": { hi: "पेय", mr: "पेये" },
  "Event Consumables": { hi: "इवेंट उपभोग्य सामग्री", mr: "इव्हेंट वापराचे साहित्य" },
};

export const PROCUREMENT_UNIT_TRANSLATIONS: Record<string, L> = {
  ltr: { hi: "लीटर", mr: "लिटर" },
  kg: { hi: "किलो", mr: "किलो" },
  pcs: { hi: "नग", mr: "नग" },
  pack: { hi: "पैक", mr: "पॅक" },
  case: { hi: "केस", mr: "केस" },
  roll: { hi: "रोल", mr: "रोल" },
  box: { hi: "डिब्बा", mr: "बॉक्स" },
  lot: { hi: "लॉट", mr: "लॉट" },
  bunch: { hi: "गुच्छा", mr: "गुच्छा" },
};
