export const CONTACT_EMAIL = String(import.meta.env.VITE_CONTACT_EMAIL || "info@tryfarely.com").trim();
export const SUPPORT_EMAIL = String(import.meta.env.VITE_SUPPORT_EMAIL || "support@tryfarely.com").trim();
export const NOREPLY_EMAIL = String(import.meta.env.VITE_NOREPLY_EMAIL || "noreply@tryfarely.com").trim();

export const CONTACT_LABEL = CONTACT_EMAIL || "Contact Farely";
export const SUPPORT_LABEL = SUPPORT_EMAIL || CONTACT_LABEL;

export const CONTACT_HREF = CONTACT_EMAIL ? `mailto:${CONTACT_EMAIL}` : "/support";
export const SUPPORT_HREF = SUPPORT_EMAIL ? `mailto:${SUPPORT_EMAIL}` : CONTACT_HREF;
