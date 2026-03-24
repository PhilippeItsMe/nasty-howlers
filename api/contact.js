const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = String(process.env.BREVO_SENDER_EMAIL || "").trim();
    const senderName = String(process.env.BREVO_SENDER_NAME || "Nasty Howlers").trim();
    const toEmail = String(process.env.CONTACT_TO_EMAIL || "contact@nasty-howlers.ch").trim().toLowerCase();

    if (!apiKey) {
        return res.status(500).json({
            error: "Server config missing: BREVO_API_KEY is required."
        });
    }

    if (!senderEmail || !EMAIL_REGEX.test(senderEmail)) {
        return res.status(500).json({
            error: "Server config invalid: BREVO_SENDER_EMAIL must be a valid email address."
        });
    }

    if (!toEmail || !EMAIL_REGEX.test(toEmail)) {
        return res.status(500).json({
            error: "Server config invalid: CONTACT_TO_EMAIL must be a valid email address."
        });
    }

    // Brevo mail endpoints require the API key, not the SMTP key.
    if (apiKey.startsWith("xsmtpsib-")) {
        return res.status(500).json({
            error: "Invalid Brevo key type. Please use an API key (xkeysib-...), not an SMTP key (xsmtpsib-...)."
        });
    }

    const firstName = String(req.body?.firstName || "").trim();
    const lastName = String(req.body?.lastName || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const mobile = String(req.body?.mobile || "").trim();
    const message = String(req.body?.message || "").trim();

    if (!firstName || !lastName || !mobile || !message) {
        return res.status(400).json({ error: "Please fill in all required fields." });
    }

    if (!EMAIL_REGEX.test(email)) {
        return res.status(400).json({ error: "Please enter a valid email." });
    }

    const safeFirstName = escapeHtml(firstName);
    const safeLastName = escapeHtml(lastName);
    const safeEmail = escapeHtml(email);
    const safeMobile = escapeHtml(mobile);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

    try {
        const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-key": apiKey,
                Accept: "application/json"
            },
            body: JSON.stringify({
                sender: {
                    name: senderName,
                    email: senderEmail
                },
                to: [
                    {
                        email: toEmail,
                        name: "Nasty Howlers"
                    }
                ],
                replyTo: {
                    email,
                    name: `${firstName} ${lastName}`.trim()
                },
                subject: `Contact form - ${firstName} ${lastName}`,
                textContent:
                    `New contact form message\n\n` +
                    `First name: ${firstName}\n` +
                    `Last name: ${lastName}\n` +
                    `Email: ${email}\n` +
                    `Mobile: ${mobile}\n\n` +
                    `Message:\n${message}`,
                htmlContent:
                    `<h2>New contact form message</h2>` +
                    `<p><strong>First name:</strong> ${safeFirstName}</p>` +
                    `<p><strong>Last name:</strong> ${safeLastName}</p>` +
                    `<p><strong>Email:</strong> ${safeEmail}</p>` +
                    `<p><strong>Mobile:</strong> ${safeMobile}</p>` +
                    `<p><strong>Message:</strong><br>${safeMessage}</p>`
            })
        });

        if (!brevoResponse.ok) {
            const brevoError = await brevoResponse.json().catch(() => ({}));
            const message =
                brevoError.message ||
                brevoError.code ||
                "Brevo email request failed.";

            return res.status(brevoResponse.status).json({ error: message });
        }

        return res.status(200).json({ ok: true });
    } catch {
        return res.status(502).json({ error: "Unable to reach Brevo." });
    }
}