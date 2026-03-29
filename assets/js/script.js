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


// ------------------ Contact form

const contactForm = document.getElementById("contact-form");

if (contactForm) {
    const firstNameInput = document.getElementById("first-name");
    const lastNameInput = document.getElementById("last-name");
    const contactEmailInput = document.getElementById("contact-email");
    const contactMobileInput = document.getElementById("contact-mobile");
    const contactMessageInput = document.getElementById("contact-message");
    const contactStatusNode = document.getElementById("contact-status");
    const contactSubmitButton = contactForm.querySelector("button[type='submit']");

    const setContactStatus = (message, isError = false) => {
        if (!contactStatusNode) {
            return;
        }

        contactStatusNode.textContent = message;
        contactStatusNode.classList.toggle("error", isError);
    };

    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!contactForm.checkValidity()) {
            contactForm.reportValidity();
            return;
        }

        const payload = {
            firstName: firstNameInput?.value.trim() || "",
            lastName: lastNameInput?.value.trim() || "",
            email: contactEmailInput?.value.trim() || "",
            mobile: contactMobileInput?.value.trim() || "",
            message: contactMessageInput?.value.trim() || ""
        };

        contactSubmitButton.disabled = true;
        setContactStatus("Sending...");

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
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

                if (response.status === 405) {
                    throw new Error(
                        "Method not allowed (405). Verify the site runs on the same Vercel domain as /api/contact and redeploy if needed."
                    );
                }

                throw new Error(result.error || `Contact request failed (HTTP ${response.status}).`);
            }

            setContactStatus("Thanks! Your message has been sent.");
            contactForm.reset();
        } catch (error) {
            setContactStatus(error.message || "Something went wrong. Please try again.", true);
        } finally {
            contactSubmitButton.disabled = false;
        }
    });
}


// ------------------ Video setup

const videoShells = document.querySelectorAll(".video-shell");

videoShells.forEach((videoShell) => {
    const mainVideo = videoShell.querySelector("video");
    const videoToggle = videoShell.querySelector(".video-toggle");

    if (!mainVideo || !videoToggle) {
        return;
    }

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
});


// ------------------ Mobile navigation

const desktopMenu = document.getElementById("desktop-menu");
const mobileMenuClosed = document.getElementById("mobile-menu-closed");
const mobileMenuOpen = document.getElementById("mobile-menu-open");
const openMenuButton = mobileMenuClosed?.querySelector("button");
const closeMenuButton = mobileMenuOpen?.querySelector("button");
const mobileMenuLinks = mobileMenuOpen?.querySelectorAll("a") || [];

if (desktopMenu && mobileMenuClosed && mobileMenuOpen && openMenuButton && closeMenuButton) {
    const mobileBreakpoint = 950;

    const setMobileMenuState = (isOpen) => {
        mobileMenuClosed.style.display = isOpen ? "none" : "block";
        mobileMenuOpen.style.display = isOpen ? "block" : "none";
        mobileMenuClosed.setAttribute("aria-hidden", String(isOpen));
        mobileMenuOpen.setAttribute("aria-hidden", String(!isOpen));
        mobileMenuClosed.setAttribute("aria-expanded", String(isOpen));
    };

    const syncNavToViewport = () => {
        const isMobile = window.innerWidth <= mobileBreakpoint;

        desktopMenu.style.display = isMobile ? "none" : "initial";

        if (isMobile) {
            setMobileMenuState(false);
            return;
        }

        mobileMenuClosed.style.display = "none";
        mobileMenuOpen.style.display = "none";
        mobileMenuClosed.setAttribute("aria-hidden", "true");
        mobileMenuOpen.setAttribute("aria-hidden", "true");
        mobileMenuClosed.setAttribute("aria-expanded", "false");
    };

    openMenuButton.addEventListener("click", () => {
        setMobileMenuState(true);
        closeMenuButton.focus();
    });

    closeMenuButton.addEventListener("click", () => {
        setMobileMenuState(false);
        openMenuButton.focus();
    });

    mobileMenuLinks.forEach((link) => {
        link.addEventListener("click", () => {
            setMobileMenuState(false);
        });
    });

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") {
            return;
        }

        if (mobileMenuOpen.style.display === "block") {
            setMobileMenuState(false);
            openMenuButton.focus();
        }
    });

    window.addEventListener("resize", syncNavToViewport);
    syncNavToViewport();
}
