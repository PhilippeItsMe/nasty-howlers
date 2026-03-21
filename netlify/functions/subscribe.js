const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: "Method not allowed" })
        };
    }

    const apiKey = process.env.BREVO_API_KEY;
    const listIdRaw = String(process.env.BREVO_LIST_ID || "").replace("#", "").trim();
    const listId = Number.parseInt(listIdRaw, 10);

    if (!apiKey || Number.isNaN(listId)) {
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: "Server is not configured." })
        };
    }

    let payload;

    try {
        payload = JSON.parse(event.body || "{}");
    } catch {
        return {
            statusCode: 400,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: "Invalid JSON body." })
        };
    }

    const email = String(payload.email || "").trim().toLowerCase();

    if (!EMAIL_REGEX.test(email)) {
        return {
            statusCode: 400,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: "Please enter a valid email." })
        };
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

            return {
                statusCode: brevoResponse.status,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ error: message })
            };
        }

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ok: true })
        };
    } catch {
        return {
            statusCode: 502,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: "Unable to reach Brevo." })
        };
    }
};
