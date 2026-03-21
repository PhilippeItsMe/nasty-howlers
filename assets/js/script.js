const newsletterForm = document.getElementById("newsletter-form");

if (newsletterForm) {
    const emailInput = document.getElementById("newsletter-email");
    const statusNode = document.getElementById("newsletter-status");
    const submitButton = newsletterForm.querySelector("button[type='submit']");

    const setStatus = (message, isError = false) => {
        if (!statusNode) {
            return;
        }

        statusNode.textContent = message;
        statusNode.classList.toggle("error", isError);
    };

    newsletterForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = emailInput?.value.trim() || "";

        if (!email) {
            setStatus("Please enter your email address.", true);
            return;
        }

        submitButton.disabled = true;
        setStatus("Sending...");

        try {
            const response = await fetch("/api/subscribe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email })
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(result.error || "Subscription failed.");
            }

            setStatus("Thanks! Your subscription is confirmed.");
            newsletterForm.reset();
        } catch (error) {
            setStatus(error.message || "Something went wrong. Please try again.", true);
        } finally {
            submitButton.disabled = false;
        }
    });
}
