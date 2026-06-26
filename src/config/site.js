export const CONTACT_EMAIL = String(import.meta.env.VITE_CONTACT_EMAIL || "info@tryfarely.com").trim();
export const SUPPORT_EMAIL = String(import.meta.env.VITE_SUPPORT_EMAIL || "support@tryfarely.com").trim();
export const NOREPLY_EMAIL = String(import.meta.env.VITE_NOREPLY_EMAIL || "noreply@tryfarely.com").trim();
export const PRIVACY_EMAIL = String(import.meta.env.VITE_PRIVACY_EMAIL || "privacy@tryfarely.com").trim();
export const SECURITY_EMAIL = String(import.meta.env.VITE_SECURITY_EMAIL || "security@tryfarely.com").trim();

export const CONTACT_LABEL = CONTACT_EMAIL || "Contact Farely";
export const SUPPORT_LABEL = SUPPORT_EMAIL || CONTACT_LABEL;
export const PRIVACY_LABEL = PRIVACY_EMAIL || CONTACT_LABEL;
export const SECURITY_LABEL = SECURITY_EMAIL || CONTACT_LABEL;

export const CONTACT_HREF = CONTACT_EMAIL ? `mailto:${CONTACT_EMAIL}` : "/support";
export const SUPPORT_HREF = SUPPORT_EMAIL ? `mailto:${SUPPORT_EMAIL}` : CONTACT_HREF;
export const PRIVACY_HREF = PRIVACY_EMAIL ? `mailto:${PRIVACY_EMAIL}` : CONTACT_HREF;
export const SECURITY_HREF = SECURITY_EMAIL ? `mailto:${SECURITY_EMAIL}` : CONTACT_HREF;
