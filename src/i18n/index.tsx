import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "hi" | "mr";

export const LANGUAGES: { code: Lang; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "mr", label: "Marathi", native: "मराठी" },
];

type Dict = Record<string, string>;

const en: Dict = {
  "app.title": "New Event Enquiry",
  "app.subtitle": "Build a complete quote across packages, menu, decor and more.",
  "lang.label": "Language",

  "tab.basics": "Basic Details",
  "tab.venue": "Venue",
  "tab.package": "Package",
  "tab.menu": "Menu",
  "tab.decor": "Decoration",
  "tab.stage": "Stage",
  "tab.chair": "Chairs",
  "tab.extras": "Extras",
  "tab.summary": "Summary",

  "common.back": "Back",
  "common.next": "Next",
  "common.saving": "Saving…",
  "common.downloadPdf": "Download PDF",
  "common.runningTotal": "Running total:",
  "common.tipPackage": "Tip: pick a package first — it pre-fills pricing across the other sections.",

  "basics.title": "Basic Details",
  "basics.desc": "Customer & event information.",
  "basics.customerName": "Customer name",
  "basics.customerName.ph": "Full name",
  "basics.phone": "Phone number",
  "basics.eventType": "Event type",
  "basics.eventType.ph": "Select event",
  "basics.eventDate": "Event date",
  "basics.guests": "Number of guests",
  "basics.source": "How did they find us?",
  "basics.source.ph": "Select source",

  "venue.title": "Venue",
  "venue.desc": "Pick a venue and the number of booking hours.",

  "package.title": "Choose a Package",
  "package.desc": "Hourly rate is set by the selected venue.",
  "package.selectVenue": "select a venue for hourly rate",

  "menu.title": "Menu Plate",
  "menu.desc": "Pick a plate package, then choose dishes within the allowed limits.",
  "menu.includedEvery": "Included with every plate:",
  "menu.selectPlate": "Select a plate package above to choose dishes.",
  "menu.included": "included",
  "menu.selected": "selected",
  "menu.extra": "extra",
  "menu.includedBeyond": "included beyond limit",
  "menu.beyondLimit": "Beyond plate limit — added to per-plate cost",
  "menu.selectLater": "Select dishes later",
  "menu.selectLaterDesc": "Pick a plate package now — individual dishes can be finalized on a follow-up visit.",
  "menu.selectLaterHint": "Dish selection is skipped. Uncheck above to choose dishes now.",
  "menu.selectedLaterSummary": "Dishes to be selected later",

  "decor.title": "Decoration",
  "decor.descFor": "Curated decor for:",
  "decor.descDefault": "Select an event type in Basic Details to see tailored decor.",
  "decor.none": "No decor presets for this event yet.",

  "stage.title": "Stage Decoration",
  "stage.desc": "Pick one stage design.",

  "chair.title": "Chairs",
  "chair.desc": "Seating multiplies by guest count.",

  "extras.title": "Extra Services",
  "extras.desc": "Add-ons to round out the event.",

  "summary.title": "Summary",
  "summary.desc": "Review everything and apply a discount.",
  "summary.customer": "Customer",
  "summary.phone": "Phone",
  "summary.event": "Event",
  "summary.date": "Date",
  "summary.timing": "Timing",
  "summary.guests": "Guests",
  "summary.source": "Source",
  "summary.lineItems": "Line items",
  "summary.noItems": "No items selected yet.",
  "summary.selectionDetails": "Details",
  "summary.discount": "Discount (%)",
  "summary.notes": "Internal notes",
  "summary.notes.ph": "Anything to remember...",
  "summary.subtotal": "Subtotal",
  "summary.grandTotal": "Grand Total",
  "summary.noDishes": "No dishes selected yet.",

  "section.venue": "Venue",
  "section.package": "Package",
  "section.menuPlate": "Menu Plate",
  "section.decoration": "Decoration",
  "section.stage": "Stage",
  "section.chairs": "Chairs",
  "section.extras": "Extras",

  "toast.needCustomer": "Please fill customer name before downloading.",
  "toast.pdfFailed": "Failed to generate PDF.",
  "toast.needStage": "Please select a stage decoration (Basic Stage Decoration is included by default).",
  "toast.needChair": "Please select a chair option.",
  "toast.needVenue": "Please select a venue.",
  "toast.needPackage": "Please select a package.",
  "toast.needBasics": "Please fill all basic details before continuing.",
  "toast.needPlate": "Please select a plate package and at least one dish.",
  "toast.needPlatePackage": "Please select a plate package.",
  "toast.needMenuIncluded": "Please select all {n} included dishes for {cat}.",
  "validate.nameRequired": "Customer name is required.",
  "validate.nameShort": "Name must be at least 2 characters.",
  "validate.nameInvalid": "Name can only contain letters, spaces, dots and hyphens.",
  "validate.phoneRequired": "Phone number is required.",
  "validate.phoneInvalid": "Enter a valid phone number (10 digits).",
  "validate.eventTypeRequired": "Event type is required.",
  "validate.eventDateRequired": "Event date is required.",
  "validate.eventDateFuture": "Event date must be in the future.",
  "validate.guestsRequired": "Number of guests is required.",
  "validate.sourceRequired": "Source is required.",
  "toast.fixErrors": "Please fix the following before continuing:",
  "toast.leadSubmitFailed": "Could not save your enquiry. Please check your connection and try again.",
};

const hi: Dict = {
  "app.title": "नई इवेंट पूछताछ",
  "app.subtitle": "पैकेज, मेनू, सजावट और बाकी सब के लिए पूरा कोटेशन बनाएं।",
  "lang.label": "भाषा",

  "tab.basics": "मूल विवरण",
  "tab.venue": "स्थान",
  "tab.package": "पैकेज",
  "tab.menu": "मेनू",
  "tab.decor": "सजावट",
  "tab.stage": "मंच",
  "tab.chair": "कुर्सियाँ",
  "tab.extras": "अतिरिक्त",
  "tab.summary": "सारांश",

  "common.back": "पीछे",
  "common.next": "अगला",
  "common.saving": "सहेजा जा रहा है…",
  "common.downloadPdf": "PDF डाउनलोड करें",
  "common.runningTotal": "कुल अब तक:",
  "common.tipPackage": "सुझाव: पहले पैकेज चुनें — इससे बाकी अनुभागों में मूल्य अपने आप भर जाते हैं।",

  "basics.title": "मूल विवरण",
  "basics.desc": "ग्राहक और इवेंट की जानकारी।",
  "basics.customerName": "ग्राहक का नाम",
  "basics.customerName.ph": "पूरा नाम",
  "basics.phone": "फ़ोन नंबर",
  "basics.eventType": "इवेंट का प्रकार",
  "basics.eventType.ph": "इवेंट चुनें",
  "basics.eventDate": "इवेंट की तारीख",
  "basics.guests": "मेहमानों की संख्या",
  "basics.source": "वे हमें कैसे मिले?",
  "basics.source.ph": "स्रोत चुनें",

  "venue.title": "स्थान",
  "venue.desc": "स्थान और बुकिंग के घंटों की संख्या चुनें।",

  "package.title": "पैकेज चुनें",
  "package.desc": "घंटे की दर चयनित स्थान के अनुसार होती है।",
  "package.selectVenue": "घंटे की दर के लिए स्थान चुनें",

  "menu.title": "मेनू थाली",
  "menu.desc": "थाली पैकेज चुनें, फिर अनुमत सीमा में व्यंजन चुनें।",
  "menu.includedEvery": "हर थाली में शामिल:",
  "menu.selectPlate": "व्यंजन चुनने के लिए ऊपर एक थाली पैकेज चुनें।",
  "menu.included": "शामिल",
  "menu.selected": "चयनित",
  "menu.extra": "अतिरिक्त",
  "menu.includedBeyond": "सीमा से अधिक",
  "menu.beyondLimit": "थाली सीमा से अधिक — प्रति थाली शुल्क में जोड़ा गया",
  "menu.selectLater": "व्यंजन बाद में चुनें",
  "menu.selectLaterDesc": "अभी थाली पैकेज चुनें — व्यक्तिगत व्यंजन बाद में अंतिम किए जा सकते हैं।",
  "menu.selectLaterHint": "व्यंजन चयन छोड़ दिया गया है। व्यंजन अभी चुनने के लिए ऊपर अनचेक करें।",
  "menu.selectedLaterSummary": "व्यंजन बाद में चुने जाएंगे",

  "decor.title": "सजावट",
  "decor.descFor": "इस इवेंट के लिए सजावट:",
  "decor.descDefault": "अनुरूप सजावट देखने के लिए मूल विवरण में इवेंट प्रकार चुनें।",
  "decor.none": "इस इवेंट के लिए अभी कोई सजावट उपलब्ध नहीं है।",

  "stage.title": "मंच सजावट",
  "stage.desc": "एक मंच डिज़ाइन चुनें।",

  "chair.title": "कुर्सियाँ",
  "chair.desc": "बैठने की संख्या मेहमानों की संख्या से गुणा होती है।",

  "extras.title": "अतिरिक्त सेवाएँ",
  "extras.desc": "इवेंट को पूरा करने के लिए ऐड-ऑन।",

  "summary.title": "सारांश",
  "summary.desc": "सब कुछ देखें और छूट लगाएं।",
  "summary.customer": "ग्राहक",
  "summary.phone": "फ़ोन",
  "summary.event": "इवेंट",
  "summary.date": "तारीख",
  "summary.timing": "समय",
  "summary.guests": "मेहमान",
  "summary.source": "स्रोत",
  "summary.lineItems": "विवरण",
  "summary.noItems": "अभी कोई वस्तु चयनित नहीं।",
  "summary.selectionDetails": "विवरण",
  "summary.discount": "छूट (%)",
  "summary.notes": "आंतरिक नोट्स",
  "summary.notes.ph": "याद रखने योग्य कुछ भी...",
  "summary.subtotal": "उप-योग",
  "summary.grandTotal": "कुल योग",
  "summary.noDishes": "अभी कोई व्यंजन चयनित नहीं।",

  "section.venue": "स्थान",
  "section.package": "पैकेज",
  "section.menuPlate": "मेनू थाली",
  "section.decoration": "सजावट",
  "section.stage": "मंच",
  "section.chairs": "कुर्सियाँ",
  "section.extras": "अतिरिक्त",

  "toast.needCustomer": "डाउनलोड से पहले ग्राहक का नाम भरें।",
  "toast.pdfFailed": "PDF बनाने में विफल।",
  "toast.needStage": "कृपया एक मंच सजावट चुनें (बेसिक मंच सजावट डिफ़ॉल्ट रूप से शामिल है)।",
  "toast.needChair": "कृपया एक कुर्सी विकल्प चुनें।",
  "toast.needVenue": "कृपया एक स्थान चुनें।",
  "toast.needPackage": "कृपया एक पैकेज चुनें।",
  "toast.needBasics": "आगे बढ़ने से पहले सभी मूल विवरण भरें।",
  "toast.needPlate": "कृपया एक थाली पैकेज और कम से कम एक व्यंजन चुनें।",
  "toast.needPlatePackage": "कृपया एक थाली पैकेज चुनें।",
  "toast.needMenuIncluded": "कृपया {cat} के लिए सभी {n} शामिल व्यंजन चुनें।",
  "validate.nameRequired": "ग्राहक का नाम आवश्यक है।",
  "validate.nameShort": "नाम कम से कम 2 अक्षरों का होना चाहिए।",
  "validate.nameInvalid": "नाम में केवल अक्षर, स्पेस, डॉट और हाइफ़न हो सकते हैं।",
  "validate.phoneRequired": "फ़ोन नंबर आवश्यक है।",
  "validate.phoneInvalid": "मान्य फ़ोन नंबर दर्ज करें (10 अंक)।",
  "validate.eventTypeRequired": "इवेंट का प्रकार आवश्यक है।",
  "validate.eventDateRequired": "इवेंट की तारीख आवश्यक है।",
  "validate.eventDateFuture": "इवेंट की तारीख भविष्य की होनी चाहिए।",
  "validate.guestsRequired": "मेहमानों की संख्या आवश्यक है।",
  "validate.sourceRequired": "स्रोत आवश्यक है।",
  "toast.fixErrors": "आगे बढ़ने से पहले कृपया इन्हें ठीक करें:",
  "toast.leadSubmitFailed": "आपकी पूछताछ सहेजी नहीं जा सकी। कृपया कनेक्शन जांचें और पुनः प्रयास करें।",
};

const mr: Dict = {
  "app.title": "नवीन इव्हेंट चौकशी",
  "app.subtitle": "पॅकेज, मेनू, सजावट आणि अधिकसाठी संपूर्ण कोटेशन तयार करा.",
  "lang.label": "भाषा",

  "tab.basics": "मूलभूत तपशील",
  "tab.venue": "स्थळ",
  "tab.package": "पॅकेज",
  "tab.menu": "मेनू",
  "tab.decor": "सजावट",
  "tab.stage": "स्टेज",
  "tab.chair": "खुर्च्या",
  "tab.extras": "अतिरिक्त",
  "tab.summary": "सारांश",

  "common.back": "मागे",
  "common.next": "पुढे",
  "common.saving": "जतन होत आहे…",
  "common.downloadPdf": "PDF डाउनलोड करा",
  "common.runningTotal": "एकूण आत्तापर्यंत:",
  "common.tipPackage": "सूचना: आधी पॅकेज निवडा — त्यामुळे इतर विभागांमध्ये किंमत आपोआप भरली जाते.",

  "basics.title": "मूलभूत तपशील",
  "basics.desc": "ग्राहक आणि इव्हेंट माहिती.",
  "basics.customerName": "ग्राहकाचे नाव",
  "basics.customerName.ph": "पूर्ण नाव",
  "basics.phone": "फोन नंबर",
  "basics.eventType": "इव्हेंट प्रकार",
  "basics.eventType.ph": "इव्हेंट निवडा",
  "basics.eventDate": "इव्हेंटची तारीख",
  "basics.guests": "पाहुण्यांची संख्या",
  "basics.source": "ते आम्हाला कसे सापडले?",
  "basics.source.ph": "स्रोत निवडा",

  "venue.title": "स्थळ",
  "venue.desc": "स्थळ आणि बुकिंगचे तास निवडा.",

  "package.title": "पॅकेज निवडा",
  "package.desc": "तासाचा दर निवडलेल्या स्थळानुसार ठरतो.",
  "package.selectVenue": "तासाच्या दरासाठी स्थळ निवडा",

  "menu.title": "मेनू थाळी",
  "menu.desc": "थाळी पॅकेज निवडा, नंतर परवानगी असलेल्या मर्यादेत पदार्थ निवडा.",
  "menu.includedEvery": "प्रत्येक थाळीसोबत समाविष्ट:",
  "menu.selectPlate": "पदार्थ निवडण्यासाठी वरून थाळी पॅकेज निवडा.",
  "menu.included": "समाविष्ट",
  "menu.selected": "निवडलेले",
  "menu.extra": "अतिरिक्त",
  "menu.includedBeyond": "मर्यादेपलीकडे",
  "menu.beyondLimit": "थाळी मर्यादेपलीकडे — प्रति थाळी खर्चात जोडले",
  "menu.selectLater": "पदार्थ नंतर निवडा",
  "menu.selectLaterDesc": "आत्ता थाळी पॅकेज निवडा — वैयक्तिक पदार्थ नंतर अंतिम करता येतात.",
  "menu.selectLaterHint": "पदार्थ निवड वगळली आहे. पदार्थ आत्ता निवडण्यासाठी वर अनचेक करा.",
  "menu.selectedLaterSummary": "पदार्थ नंतर निवडले जातील",

  "decor.title": "सजावट",
  "decor.descFor": "या इव्हेंटसाठी सजावट:",
  "decor.descDefault": "योग्य सजावट पाहण्यासाठी मूलभूत तपशीलमध्ये इव्हेंट प्रकार निवडा.",
  "decor.none": "या इव्हेंटसाठी सध्या कोणतीही सजावट नाही.",

  "stage.title": "स्टेज सजावट",
  "stage.desc": "एक स्टेज डिझाइन निवडा.",

  "chair.title": "खुर्च्या",
  "chair.desc": "आसन व्यवस्था पाहुण्यांच्या संख्येनुसार वाढते.",

  "extras.title": "अतिरिक्त सेवा",
  "extras.desc": "इव्हेंट पूर्ण करण्यासाठी अॅड-ऑन.",

  "summary.title": "सारांश",
  "summary.desc": "सर्व पहा आणि सवलत लागू करा.",
  "summary.customer": "ग्राहक",
  "summary.phone": "फोन",
  "summary.event": "इव्हेंट",
  "summary.date": "तारीख",
  "summary.timing": "वेळ",
  "summary.guests": "पाहुणे",
  "summary.source": "स्रोत",
  "summary.lineItems": "तपशील",
  "summary.noItems": "अद्याप कोणतीही वस्तू निवडलेली नाही.",
  "summary.selectionDetails": "तपशील",
  "summary.discount": "सवलत (%)",
  "summary.notes": "अंतर्गत नोट्स",
  "summary.notes.ph": "लक्षात ठेवण्यासारखे काही...",
  "summary.subtotal": "उप-एकूण",
  "summary.grandTotal": "एकूण रक्कम",
  "summary.noDishes": "अद्याप कोणतेही पदार्थ निवडलेले नाहीत.",

  "section.venue": "स्थळ",
  "section.package": "पॅकेज",
  "section.menuPlate": "मेनू थाळी",
  "section.decoration": "सजावट",
  "section.stage": "स्टेज",
  "section.chairs": "खुर्च्या",
  "section.extras": "अतिरिक्त",

  "toast.needCustomer": "डाउनलोड करण्यापूर्वी ग्राहकाचे नाव भरा.",
  "toast.pdfFailed": "PDF तयार करण्यात अयशस्वी.",
  "toast.needStage": "कृपया स्टेज सजावट निवडा (बेसिक स्टेज सजावट डीफॉल्टनुसार समाविष्ट आहे).",
  "toast.needChair": "कृपया खुर्ची पर्याय निवडा.",
  "toast.needVenue": "कृपया स्थळ निवडा.",
  "toast.needPackage": "कृपया पॅकेज निवडा.",
  "toast.needBasics": "पुढे जाण्यापूर्वी सर्व मूलभूत तपशील भरा.",
  "toast.needPlate": "कृपया थाळी पॅकेज आणि किमान एक पदार्थ निवडा.",
  "toast.needPlatePackage": "कृपया थाळी पॅकेज निवडा.",
  "toast.needMenuIncluded": "कृपया {cat} साठी सर्व {n} समाविष्ट पदार्थ निवडा.",
  "validate.nameRequired": "ग्राहकाचे नाव आवश्यक आहे.",
  "validate.nameShort": "नाव किमान 2 अक्षरांचे असावे.",
  "validate.nameInvalid": "नावात फक्त अक्षरे, स्पेस, डॉट आणि हायफन असू शकतात.",
  "validate.phoneRequired": "फोन नंबर आवश्यक आहे.",
  "validate.phoneInvalid": "वैध फोन नंबर टाका (10 अंक).",
  "validate.eventTypeRequired": "इव्हेंट प्रकार आवश्यक आहे.",
  "validate.eventDateRequired": "इव्हेंटची तारीख आवश्यक आहे.",
  "validate.eventDateFuture": "इव्हेंटची तारीख भविष्यातील असावी.",
  "validate.guestsRequired": "पाहुण्यांची संख्या आवश्यक आहे.",
  "validate.sourceRequired": "स्रोत आवश्यक आहे.",
  "toast.fixErrors": "पुढे जाण्यापूर्वी कृपया हे दुरुस्त करा:",
  "toast.leadSubmitFailed": "तुमची चौकशी जतन करता आली नाही. कृपया कनेक्शन तपासा आणि पुन्हा प्रयत्न करा.",
};

const DICTS: Record<Lang, Dict> = { en, hi, mr };

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (key: string) => string };
const LangContext = createContext<Ctx | null>(null);

const STORAGE_KEY = "app.lang";

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";
    const saved = window.localStorage.getItem(STORAGE_KEY) as Lang | null;
    return saved && DICTS[saved] ? saved : "en";
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore storage write errors (private mode, quota, etc.)
    }
    if (typeof document !== "undefined") document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => setLangState(l);
  const t = (key: string) => DICTS[lang][key] ?? DICTS.en[key] ?? key;

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
};

export const useT = () => {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useT must be used within LanguageProvider");
  return ctx;
};