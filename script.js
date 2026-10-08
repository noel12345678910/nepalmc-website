const SERVER_IP = "nepalmc.com";

function generateOrderCode() {
    // Unambiguous charset: no 0/O or 1/I, so it's easy to read out loud or type back.
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const length = 6;

    let code = "";

    if (window.crypto && window.crypto.getRandomValues) {
        const values = new Uint32Array(length);
        window.crypto.getRandomValues(values);

        for (let i = 0; i < length; i++) {
            code += chars[values[i] % chars.length];
        }
    } else {
        for (let i = 0; i < length; i++) {
            code += chars[Math.floor(Math.random() * chars.length)];
        }
    }

    return `NCP-${code}`;
}

function copyServerIP(button) {
    navigator.clipboard.writeText(SERVER_IP).then(() => {
        const label = button.querySelector("#copy span");
        if (!label) return;

        const original = label.textContent;
        label.textContent = "Copied!";

        setTimeout(() => {
            label.textContent = original;
        }, 1500);
    });
}

function showBuyPopup(packageName, price, image) {
    const overlay = document.getElementById("buy-overlay");
    const packageText = document.getElementById("buy-package");
    const priceText = document.getElementById("buy-price");
    const productImage = document.getElementById("buy-product-image");

    if (!overlay) return;

    packageText.textContent = packageName;
    priceText.textContent = price;
    productImage.src = image;
    productImage.alt = packageName;

    overlay.classList.add("active");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("buy-open");

    setTimeout(() => {
        document.getElementById("minecraft-username").focus();
    }, 250);
}

function showSuccessPopup(orderCode) {
    const overlay = document.getElementById("success-overlay");
    const codeText = document.getElementById("success-code");

    if (!overlay) {
        // The success popup markup isn't on this page (likely an old
        // store.html) — fall back so the code still reaches the user.
        console.error(
            "success-overlay element not found — is store.html up to date?"
        );
        alert(
            "Payment submitted successfully!\n\n" +
            `Your order code is ${orderCode}\n\n` +
            "Remember this code. If you don't receive your NepCoins within " +
            "24 hours, open a ticket on Discord and include it."
        );
        return;
    }

    if (codeText) {
        codeText.textContent = orderCode;
    }

    overlay.classList.add("active");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("buy-open");
}

function copyOrderCode() {
    const codeText = document.getElementById("success-code");
    const copyButton = document.getElementById("success-code-copy");

    if (!codeText) return;

    const code = codeText.textContent.trim();

    navigator.clipboard.writeText(code).then(() => {
        if (!copyButton) return;

        copyButton.classList.add("copied");

        const original = copyButton.innerHTML;
        copyButton.innerHTML =
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '<path d="M4 12.5l5 5L20 6.5"></path></svg>';

        setTimeout(() => {
            copyButton.classList.remove("copied");
            copyButton.innerHTML = original;
        }, 1500);
    });
}

function closeSuccessPopup() {
    const overlay = document.getElementById("success-overlay");

    if (!overlay) return;

    overlay.classList.remove("active");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("buy-open");
}

function closeBuyPopup() {
    const overlay = document.getElementById("buy-overlay");

    if (!overlay) return;

    overlay.classList.remove("active");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("buy-open");
}

async function submitBuyForm(event) {
    event.preventDefault();

    const form = document.getElementById("buy-form");

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const submitButton = form.querySelector(".submit-payment");

    const username = document.getElementById("minecraft-username").value.trim();
    const discordUsername = document.getElementById("discord-username").value.trim();
    const paymentMethod = document.getElementById("payment-method").value;
    const transactionId = document.getElementById("transaction-id").value.trim();

    const packageName = document.getElementById("buy-package").textContent.trim();
    const amount = document.getElementById("buy-price").textContent.trim();

    const orderCode = generateOrderCode();

    const screenshotInput = document.getElementById("payment-screenshot");

    if (!screenshotInput.files.length) {
        alert("Please upload your payment receipt.");
        return;
    }

    const screenshotFile = screenshotInput.files[0];

    const allowedTypes = [
        "image/png",
        "image/jpeg",
        "image/webp"
    ];

    if (!allowedTypes.includes(screenshotFile.type)) {
        alert("Please upload a PNG, JPG, or WEBP image.");
        return;
    }

    if (screenshotFile.size > 8 * 1024 * 1024) {
        alert("Your payment screenshot must be smaller than 8MB.");
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";

    try {
        const reader = new FileReader();

        const screenshotBase64 = await new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error("Failed to read screenshot"));
            reader.readAsDataURL(screenshotFile);
        });

        const response = await fetch("/api/payment", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                discordUsername,
                paymentMethod,
                packageName,
                amount,
                transactionId,
                screenshot: screenshotBase64,
                orderCode
            })
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message || "Failed to submit payment."
            );
        }

        const confirmedCode = result.orderCode || orderCode;

        showSuccessPopup(confirmedCode);

        form.reset();

        const title = document.getElementById("upload-title");
        const text = document.getElementById("upload-text");

        if (title) {
            title.textContent = "Upload payment screenshot";
        }

        if (text) {
            text.textContent = "PNG, JPG or WEBP · Click to choose";
        }

        const paymentQR = document.getElementById("payment-qr");

        if (paymentQR) {
            paymentQR.classList.remove("active");
        }

        closeBuyPopup();

    } catch (error) {
        console.error("Payment submission error:", error);

        alert(
            "Your payment could not be submitted.\n\n" +
            "Please try again. If the problem continues, contact NepalMC staff on Discord."
        );

    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Submit payment";
    }
}

document.addEventListener("DOMContentLoaded", () => {

    const ipButton = document.getElementById("main-ip-button");

    if (ipButton) {
        ipButton.addEventListener("click", () => copyServerIP(ipButton));
    }

    const navIP = document.getElementById("ip");

    if (navIP) {
        navIP.addEventListener("click", () => {
            navigator.clipboard.writeText(SERVER_IP);
        });
    }

    const screenshotInput = document.getElementById("payment-screenshot");

    if (screenshotInput) {
        screenshotInput.addEventListener("change", () => {
            const title = document.getElementById("upload-title");
            const text = document.getElementById("upload-text");

            if (!screenshotInput.files.length) {
                title.textContent = "Upload payment screenshot";
                text.textContent = "PNG, JPG or WEBP · Click to choose";
                return;
            }

            const file = screenshotInput.files[0];

            title.textContent = file.name;
            text.textContent = "Screenshot selected · Click to change";
        });
    }

    const paymentMethod = document.getElementById("payment-method");
    const paymentQR = document.getElementById("payment-qr");

    if (paymentMethod && paymentQR) {
        paymentMethod.addEventListener("change", () => {

            if (paymentMethod.value) {
                paymentQR.classList.add("active");
            } else {
                paymentQR.classList.remove("active");
            }

        });
    }

    const overlay = document.getElementById("buy-overlay");

    if (overlay) {
        overlay.addEventListener("click", (event) => {
            if (event.target === overlay) {
                closeBuyPopup();
            }
        });
    }

    const successOverlay = document.getElementById("success-overlay");

    if (successOverlay) {
        successOverlay.addEventListener("click", (event) => {
            if (event.target === successOverlay) {
                closeSuccessPopup();
            }
        });
    }

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeBuyPopup();
            closeSuccessPopup();
        }
    });

});