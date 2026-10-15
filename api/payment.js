function generateFallbackCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";

    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }

    return code;
}

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            message: "Method not allowed"
        });
    }

    try {
        const {
            username,
            discordUsername,
            paymentMethod,
            packageName,
            amount,
            transactionId,
            screenshot,
            orderCode
        } = req.body;

        if (
            !username ||
            !discordUsername ||
            !paymentMethod ||
            !packageName ||
            !amount ||
            !transactionId ||
            !screenshot
        ) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        // The client generates this, but never trust the client alone —
        // fall back to a server-side code if it's missing or malformed.
        const isValidOrderCode = typeof orderCode === "string" &&
            /^NCP-[A-Z0-9]{6}$/.test(orderCode);

        const finalOrderCode = isValidOrderCode
            ? orderCode
            : `NCP-${generateFallbackCode()}`;

        const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

        if (!webhookUrl) {
            console.error("DISCORD_WEBHOOK_URL is missing");

            return res.status(500).json({
                success: false,
                message: "Server configuration error"
            });
        }

        const imageBuffer = Buffer.from(
            screenshot.split(",")[1],
            "base64"
        );

        const fileName = "payment-receipt.png";

        const embed = {
            color: 0x3f91ff,
            description:
                `# NEPCOINS PACKAGE - ${finalOrderCode}\n` +
                `# IGN: ${username}\n` +
                `# package: ${packageName} - ${amount}`,
            fields: [
                {
                    name: "Discord",
                    value: discordUsername,
                    inline: true
                },
                {
                    name: "Payment method",
                    value: paymentMethod,
                    inline: true
                },
                {
                    name: "Transaction / reference ID",
                    value: transactionId,
                    inline: false
                }
            ],
            image: {
                url: `attachment://${fileName}`
            },
            timestamp: new Date().toISOString(),
            footer: {
                text: `NepalMC Payments · ${finalOrderCode}`
            }
        };

        const formData = new FormData();

        formData.append(
            "payload_json",
            JSON.stringify({
                username: "NepalMC Payments",
                content: "@everyone New payment received!",
                allowed_mentions: {
                    parse: ["everyone"]
                },
                embeds: [embed]
            })
        );

        formData.append(
            "files[0]",
            new Blob([imageBuffer], {
                type: "image/png"
            }),
            fileName
        );

        const discordResponse = await fetch(webhookUrl, {
            method: "POST",
            body: formData
        });

        if (!discordResponse.ok) {
            const errorText = await discordResponse.text();

            console.error("Discord webhook error:", errorText);

            return res.status(500).json({
                success: false,
                message: "Failed to send payment to Discord"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Payment submitted successfully",
            orderCode: finalOrderCode
        });

    } catch (error) {
        console.error("Payment API error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
}