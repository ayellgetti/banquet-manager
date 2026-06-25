import type { Lang } from "./index";

type L = Partial<Record<Lang, string>>;

export const MENU_CATEGORY_TRANSLATIONS: Record<string, L> = {
  "Welcome Drink": { hi: "स्वागत पेय", mr: "स्वागत पेय" },
  "Salads": { hi: "सलाद", mr: "सॅलड" },
  "Farsan": { hi: "फरसान", mr: "फरसाण" },
  "Starters": { hi: "स्टार्टर", mr: "स्टार्टर" },
  "Main Course": { hi: "मुख्य व्यंजन", mr: "मुख्य पदार्थ" },
  "Breakfast": { hi: "नाश्ता", mr: "नाश्ता" },
  "Indian Breads": { hi: "भारतीय ब्रेड", mr: "भारतीय भाकरी" },
  "Raita": { hi: "रायता", mr: "रायता" },
  "Rice": { hi: "चावल", mr: "भात" },
  "Dal": { hi: "दाल", mr: "डाळ" },
  "Sweets & Ice Cream": { hi: "मिठाई या आइसक्रीम", mr: "मिठाई किंवा आइसक्रीम" },
  "Live Counters": { hi: "लाइव काउंटर", mr: "लाइव्ह काउंटर" },
};

export const MENU_SUBCATEGORY_TRANSLATIONS: Record<string, L> = {
  "Basic": { hi: "बेसिक", mr: "बेसिक" },
  "Fresh Fruit Juice": { hi: "ताज़ा फल का जूस", mr: "ताजे फळांचा रस" },
  "Mocktails (+₹20 Extra)": { hi: "मॉकटेल (+₹20 अतिरिक्त)", mr: "मॉकटेल (+₹20 अतिरिक्त)" },
  "Veg Starter": { hi: "शाकाहारी स्टार्टर", mr: "शाकाहारी स्टार्टर" },
  "Paneer Starter": { hi: "पनीर स्टार्टर", mr: "पनीर स्टार्टर" },
  "Paneer Main Course": { hi: "पनीर मुख्य व्यंजन", mr: "पनीर मुख्य पदार्थ" },
  "Veg Main Course": { hi: "शाकाहारी मुख्य व्यंजन", mr: "शाकाहारी मुख्य पदार्थ" },
  "Kathiawadi": { hi: "काठियावाड़ी", mr: "काठियावाडी" },
  "Rajasthani": { hi: "राजस्थानी", mr: "राजस्थानी" },
  "Sweets": { hi: "मिठाई", mr: "मिठाई" },
  "Ice Cream — Special (+₹25 Extra)": { hi: "आइसक्रीम — स्पेशल (+₹25 अतिरिक्त)", mr: "आइसक्रीम — स्पेशल (+₹25 अतिरिक्त)" },
  "Ice Cream — Regular": { hi: "आइसक्रीम — रेगुलर", mr: "आइसक्रीम — रेग्युलर" },
  "Chaat Counter": { hi: "चाट काउंटर", mr: "चाट काउंटर" },
  "Pasta Counter": { hi: "पास्ता काउंटर", mr: "पास्ता काउंटर" },
  "Pizza": { hi: "पिज़्ज़ा", mr: "पिझ्झा" },
  "South Indian Counter": { hi: "दक्षिण भारतीय काउंटर", mr: "दक्षिण भारतीय काउंटर" },
  "Chinese / Oriental Counter": { hi: "चाइनीज / ओरिएंटल काउंटर", mr: "चायनीज / ओरिएंटल काउंटर" },
  "Additional Counters": { hi: "अतिरिक्त काउंटर", mr: "अतिरिक्त काउंटर" },
};

export const COMMON_PLATE_TRANSLATIONS: Record<string, L> = {
  "Salad": { hi: "सलाद", mr: "सॅलड" },
  "Papad": { hi: "पापड़", mr: "पापड" },
  "Achar": { hi: "अचार", mr: "लोणचे" },
  "Raita": { hi: "रायता", mr: "रायता" },
  "Chutney": { hi: "चटनी", mr: "चटणी" },
  "Mukhwas": { hi: "मुखवास", mr: "मुखवास" },
  "Packaged Drinking Water": { hi: "पैक किया पीने का पानी", mr: "बाटलीबंद पिण्याचे पाणी" },
};
