// Copies the server IP to the clipboard when the copy button is clicked.

const SERVER_IP = "nepalmc.com";

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

// Shown when someone clicks "Buy now" on the store page.
function showBuyPopup() {
    alert("To buy this package, please head to the #ticket section of the Discord and open a store ticket.\n\nThe website checkout system is still under construction.");
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
});
