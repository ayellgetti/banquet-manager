export type VisitingCardContact = {
  name: string;
  phone: string;
};

export const VISITING_CARD_BUSINESS_NAME = "Eternity Banquet";

export const VISITING_CARD_LOGO = "/eternity-banquet-logo.png";

export const VISITING_CARD_ADDRESS =
  "Plot No. 93-A, 2nd Floor, Bank Of Baroda, Kandivali co-operative Government Industrial Estate Ltd, Opp Sahyadri Nagar Hanuman Temple Kandivali, Charkop Gaon, Kandivali West, Mumbai, Maharashtra 400067";

export const VISITING_CARD_CONTACTS: VisitingCardContact[] = [
  { name: "Akash Y", phone: "9930413300" },
  { name: "Harshal Joshi", phone: "9930143300" },
];

export const VISITING_CARD_MAPS_URL = "https://maps.app.goo.gl/HheP6zr9LLzHH3M56";

export const phoneTel = (phone: string) => `+91${phone.replace(/\D/g, "")}`;

export const phoneWhatsApp = (phone: string) => `91${phone.replace(/\D/g, "")}`;

export const visitingCardMapsUrl = () => VISITING_CARD_MAPS_URL;
