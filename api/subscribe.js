const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
    const allowedMethods = "POST, OPTIONS";

    res.setHeader("Allow", allowedMethods);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", allowedMethods);
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Max-Age", "86400");

    if (req.method === "OPTIONS") {
        return res.status(204).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({
            error: `Method not allowed: ${req.method || "UNKNOWN"}. Use POST.`
        });
    }

    const apiKey = process.env.BREVO_API_KEY;
    const listIdRaw = String(process.env.BREVO_LIST_ID || "").replace("#", "").trim();
    const listId = Number.parseInt(listIdRaw, 10);

    if (!apiKey && Number.isNaN(listId)) {
        return res.status(500).json({
            error: "Server config missing: BREVO_API_KEY and BREVO_LIST_ID are required."
        });
    }

    if (!apiKey) {
        return res.status(500).json({
            error: "Server config missing: BREVO_API_KEY is required."
        });
    }

    if (Number.isNaN(listId)) {
        return res.status(500).json({
            error: "Server config invalid: BREVO_LIST_ID must be a number (example: 5)."
        });
    }

    // Brevo contacts API requires the API key, not the SMTP key.
    if (apiKey.startsWith("xsmtpsib-")) {
        return res.status(500).json({
            error: "Invalid Brevo key type. Please use an API key (xkeysib-...), not an SMTP key (xsmtpsib-...)."
        });
    }

    const email = String(req.body?.email || "").trim().toLowerCase();

    if (!EMAIL_REGEX.test(email)) {
        return res.status(400).json({ error: "Please enter a valid email." });
    }

    try {
        const brevoResponse = await fetch("https://api.brevo.com/v3/contacts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-key": apiKey
            },
            body: JSON.stringify({
                email,
                listIds: [listId],
                updateEnabled: true
            })
        });

        if (!brevoResponse.ok) {
            const brevoError = await brevoResponse.json().catch(() => ({}));
            const message =
                brevoError.message ||
                brevoError.code ||
                "Brevo subscription request failed.";

            return res.status(brevoResponse.status).json({ error: message });
        }

        return res.status(200).json({ ok: true });
    } catch {
        return res.status(502).json({ error: "Unable to reach Brevo." });
    }
}
