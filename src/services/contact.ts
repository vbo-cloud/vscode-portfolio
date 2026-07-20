const apiUrl = import.meta.env.VITE_CONTACT_API_URL || "";

export interface ContactPayload {
    name: string;
    email: string;
    subject: string;
    message: string;
    /** Honeypot — must stay empty; a filled value marks the submission as bot traffic server-side. */
    website?: string;
}

export const sendContactEmail = async (payload: ContactPayload): Promise<{ ok: true } | { ok: false; error: string }> => {
    if (!apiUrl) {
        return { ok: false, error: "Contact API is not configured (set VITE_CONTACT_API_URL)." };
    }

    try {
        // The backend Function is a generic {name, email, subject, message} relay
        // (see docs/prompts/prompt-09-contact-form-azure-function.md) — it has no
        // idea this is the portfolio. "PORTFOLIO : " is purely Vincent's own
        // visual marker in his inbox, so it's added here, not server-side.
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...payload, subject: `PORTFOLIO : ${payload.subject}` }),
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            return { ok: false, error: result.error || "Failed to send the message." };
        }
        return { ok: true };
    } catch {
        return { ok: false, error: "Network error — please try again." };
    }
};
