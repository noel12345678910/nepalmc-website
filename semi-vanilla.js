const semiVanillaRanks = {
    awakened: {
        name: "Awakened", price: "99 NepCoins", loss: "45%", perks: ["/hat", "/craft", "Only 45% of your Shards are lost when you die, instead of the default 65%"],
        sections: [
            ["Armor", ["Diamond Helmet — Protection II", "Diamond Chestplate — Protection II", "Diamond Leggings — Protection II", "Diamond Boots — Protection II"]],
            ["Weapons and tools", ["Diamond Sword — Sharpness II", "Diamond Pickaxe — Efficiency II"]],
            ["Items and supplies", ["64 Golden Carrots", "32 Cooked Beef", "16 Golden Apples", "32 Diamonds", "32 Iron Blocks", "16 Ender Pearls", "2 Totems of Undying", "64 Torches"]]
        ]
    },
    ascendant: {
        name: "Ascendant", price: "199 NepCoins", loss: "35%", perks: ["/hat", "/craft", "/feed", "/enderchest", "Only 35% of your Shards are lost when you die"],
        sections: [
            ["Armor", ["Diamond Helmet — Protection III, Unbreaking II", "Diamond Chestplate — Protection III, Unbreaking II", "Diamond Leggings — Protection III, Unbreaking II", "Diamond Boots — Protection III, Unbreaking II"]],
            ["Weapons and tools", ["Diamond Sword — Sharpness III, Unbreaking II", "Diamond Pickaxe — Efficiency III, Unbreaking II"]],
            ["Items and supplies", ["1 Shield", "2 Diamond Blocks", "48 Diamonds", "64 Golden Carrots", "32 Golden Apples", "32 Ender Pearls", "4 Totems of Undying", "32 Obsidian", "64 Cooked Beef"]]
        ]
    },
    overlord: {
        name: "Overlord", price: "399 NepCoins", loss: "30%", perks: ["Inherits Awakened and Ascendant perks", "Only 30% of your Shards are lost when you die"],
        sections: [
            ["Armor", ["Diamond Helmet — Protection IV, Unbreaking III", "Diamond Chestplate — Protection IV, Unbreaking III", "Diamond Leggings — Protection IV, Unbreaking III", "Diamond Boots — Protection IV, Unbreaking III"]],
            ["Weapons and tools", ["Diamond Sword — Sharpness IV, Unbreaking III", "Diamond Pickaxe — Efficiency IV, Unbreaking III", "Diamond Axe — Efficiency IV"]],
            ["Items and supplies", ["4 Diamond Blocks", "64 Diamonds", "48 Golden Apples", "6 Totems of Undying", "48 Ender Pearls", "64 Golden Carrots"]]
        ]
    },
    sovereign: {
        name: "Sovereign", price: "799 NepCoins", loss: "25%", perks: ["Inherits all lower-rank perks", "/nick", "/pv", "/ptime", "/pweather", "Only 25% of your Shards are lost when you die"],
        sections: [
            ["Armor", ["Diamond Helmet — Protection IV, Unbreaking III", "Diamond Chestplate — Protection IV, Unbreaking III", "Diamond Leggings — Protection IV, Unbreaking III", "Diamond Boots — Protection IV, Unbreaking III"]],
            ["Weapons and tools", ["Diamond Sword — Sharpness V, Unbreaking III", "Diamond Pickaxe — Efficiency V, Unbreaking III", "Diamond Axe — Efficiency V, Unbreaking III", "Elytra — Unbreaking III, Mending"]],
            ["Items and supplies", ["64 Cooked Beef", "64 Golden Carrots", "64 Golden Apples", "64 Diamonds", "8 Diamond Blocks", "64 Ender Pearls", "8 Totems of Undying", "64 Obsidian", "32 End Crystals", "64 Firework Rockets", "64 Experience Bottles", "2 Shulker Boxes", "1 Shield"]]
        ]
    },
    immortal: {
        name: "Immortal", price: "1,099 NepCoins", loss: "10%", perks: ["Inherits all lower-rank perks", "Colored nickname", "Only 10% of your Shards are lost when you die"],
        sections: [
            ["Armor", ["Netherite Helmet — Protection IV, Unbreaking III, Mending", "Netherite Chestplate — Protection IV, Unbreaking III, Mending", "Netherite Leggings — Protection IV, Unbreaking III, Mending", "Netherite Boots — Protection IV, Unbreaking III, Mending"]],
            ["Weapons and tools", ["Netherite Sword — Sharpness V, Unbreaking III, Mending", "Netherite Pickaxe — Efficiency V, Unbreaking III, Mending", "Netherite Axe — Efficiency V, Unbreaking III, Mending", "Elytra — Unbreaking III, Mending"]],
            ["Items and supplies", ["64 Cooked Beef", "64 Golden Carrots", "64 Golden Apples", "8 Enchanted Golden Apples", "64 Diamonds", "16 Diamond Blocks", "8 Netherite Ingots", "64 Ender Pearls", "12 Totems of Undying", "128 Obsidian", "64 End Crystals", "128 Firework Rockets", "128 Experience Bottles", "4 Shulker Boxes", "1 Shield"]]
        ]
    }
};

function renderSemiVanillaRank(key) {
    const rank = semiVanillaRanks[key];
    const panel = document.getElementById("vanilla-rank-detail");
    if (!rank || !panel) return;
    const perks = rank.perks.map(item => `<li>${item.startsWith("/") ? `<code>${item}</code>` : item}</li>`).join("");
    const sections = rank.sections.map(([title, items]) => `<section class="vanilla-rank-kit-section"><h4>${title}</h4><ul>${items.map(item => `<li>${item}</li>`).join("")}</ul></section>`).join("");
    panel.innerHTML = `<div class="vanilla-rank-overview"><div><h3>${rank.name}</h3><p class="vanilla-rank-price">${rank.price}</p></div><div class="vanilla-rank-loss"><span>Shard loss</span><strong>${rank.loss}</strong></div></div><section class="vanilla-rank-perks"><h4>Perks</h4><ul>${perks}</ul></section><section class="vanilla-rank-kit"><h4 class="vanilla-rank-kit-title">Kit</h4><div class="vanilla-rank-kit-grid">${sections}</div></section><a class="vanilla-rank-buy" href="store.html">View Store</a>`;
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-open-popup]").forEach(button => {
        const dialog = document.getElementById(button.dataset.openPopup);
        button.addEventListener("click", () => dialog?.showModal());
    });

    document.querySelectorAll(".vanilla-popup").forEach(dialog => {
        dialog.querySelector(".vanilla-popup-close")?.addEventListener("click", () => dialog.close());
        dialog.addEventListener("click", event => {
            if (event.target === dialog) dialog.close();
        });
    });

    const tabs = document.querySelectorAll("[data-rank]");
    tabs.forEach(tab => tab.addEventListener("click", () => {
        tabs.forEach(item => item.setAttribute("aria-selected", String(item === tab)));
        renderSemiVanillaRank(tab.dataset.rank);
    }));
    renderSemiVanillaRank("awakened");
});
