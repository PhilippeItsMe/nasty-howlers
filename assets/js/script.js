// ------------------ Newsletter Optin

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

            const contentType = response.headers.get("content-type") || "";
            let result = {};

            if (contentType.includes("application/json")) {
                result = await response.json().catch(() => ({}));
            } else {
                const text = await response.text().catch(() => "");
                result = { error: text ? text.slice(0, 180) : "" };
            }

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("API route not found (404). Open the site from Vercel, not GitHub Pages.");
                }

                throw new Error(result.error || `Subscription failed (HTTP ${response.status}).`);
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


// ------------------ Video setup

const mainVideo = document.getElementById("main-video");
const videoToggle = document.querySelector(".video-toggle");
const videoShell = document.querySelector(".video-shell");

if (mainVideo && videoToggle && videoShell) {
    const syncVideoUI = () => {
        const paused = mainVideo.paused;
        videoToggle.textContent = paused ? "PLAY" : "PAUSE";
        videoToggle.setAttribute("aria-label", paused ? "Play video" : "Pause video");
        videoShell.classList.toggle("is-playing", !paused);
        videoShell.classList.toggle("is-paused", paused);
    };

    videoToggle.addEventListener("click", () => {
        if (mainVideo.paused) {
            mainVideo.play();
            return;
        }

        mainVideo.pause();
    });

    mainVideo.addEventListener("click", () => {
        if (mainVideo.paused) {
            mainVideo.play();
            return;
        }

        mainVideo.pause();
    });

    mainVideo.addEventListener("play", syncVideoUI);
    mainVideo.addEventListener("pause", syncVideoUI);
    mainVideo.addEventListener("ended", syncVideoUI);
    syncVideoUI();
}
