export type VisitingCardContact = {
  name: string;
  phone: string;
};

export const VISITING_CARD_BUSINESS_NAME = "Eternity Banquet";

export const VISITING_CARD_LOGO = "/logo-removebg-preview.png";

export const VISITING_CARD_ADDRESS =
  "Plot No. 93-A, 2nd Floor, Bank Of Baroda, Kandivali co-operative Government Industrial Estate Ltd, Opp Sahyadri Nagar Hanuman Temple Kandivali, Charkop Gaon, Kandivali West, Mumbai, Maharashtra 400067";

export const VISITING_CARD_CONTACTS: VisitingCardContact[] = [
  { name: "Akash Y", phone: "9930413300" },
  { name: "Harshal J", phone: "9930143300" },
];

export const VISITING_CARD_MAPS_URL = "https://maps.app.goo.gl/HheP6zr9LLzHH3M56";

/** Update if your Instagram profile URL differs from what the QR encodes. */
export const VISITING_CARD_INSTAGRAM_URL = "https://www.instagram.com/eternitybanquet";

export const VISITING_CARD_QR_MAP = "/qr-map-location.png";
export const VISITING_CARD_QR_WHATSAPP = "/qr-whatsapp.png";
export const VISITING_CARD_QR_INSTAGRAM = "/qr-instagram.png";

export const phoneTel = (phone: string) => `+91${phone.replace(/\D/g, "")}`;

export const phoneWhatsApp = (phone: string) => `91${phone.replace(/\D/g, "")}`;

export const visitingCardMapsUrl = () => VISITING_CARD_MAPS_URL;

export type VisitingCardQrCode = {
  id: string;
  image: string;
  href: string;
  labelKey: "visitingCard.qrMaps" | "visitingCard.qrWhatsApp" | "visitingCard.qrInstagram";
};

export const VISITING_CARD_QR_CODES: VisitingCardQrCode[] = [
  {
    id: "map",
    image: VISITING_CARD_QR_MAP,
    href: VISITING_CARD_MAPS_URL,
    labelKey: "visitingCard.qrMaps",
  },
  {
    id: "whatsapp",
    image: VISITING_CARD_QR_WHATSAPP,
    href: `https://wa.me/${phoneWhatsApp(VISITING_CARD_CONTACTS[0].phone)}`,
    labelKey: "visitingCard.qrWhatsApp",
  },
  {
    id: "instagram",
    image: VISITING_CARD_QR_INSTAGRAM,
    href: VISITING_CARD_INSTAGRAM_URL,
    labelKey: "visitingCard.qrInstagram",
  },
];
