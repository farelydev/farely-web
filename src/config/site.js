export const CONTACT_EMAIL = String(import.meta.env.VITE_CONTACT_EMAIL || "info@tryfarely.com").trim();

export const CONTACT_LABEL = CONTACT_EMAIL || "Contact Farely";

export const CONTACT_HREF = CONTACT_EMAIL ? `mailto:${CONTACT_EMAIL}` : "/support";
