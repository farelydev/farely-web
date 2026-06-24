export const CONTACT_EMAIL = String(import.meta.env.VITE_CONTACT_EMAIL || "").trim();

export const CONTACT_LABEL = CONTACT_EMAIL || "Support email is being set up";

export const CONTACT_HREF = CONTACT_EMAIL ? `mailto:${CONTACT_EMAIL}` : "/support";
