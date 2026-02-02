import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import express from "express";

const app = express();
app.use(express.json());

// ===== CONFIG =====
const BOT_TOKEN = process.env.BOT_TOKEN; // your Discord bot token
const LOG_CHANNEL_ID = "1467847883456778358"; // logs will go here
const ADMIN_IDS = ["1001562621381714080","1375016755822596096","1389631531114430594","1255892341206552607"]; // who can use admin commands

// ===== KEYS =====
const keys = new Map();

// ===== DISCORD BOT =====
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once("ready", () => {
    console.log(`Discord bot ready as ${client.user.tag}`);
});

// send log embed
async function logDiscord(title, description, color = 0x2b2d31) {
    const channel = await client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
    if (!channel) return;
    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setTimestamp();
    channel.send({ embeds: [embed] }).catch(() => {});
}

// ===== DISCORD COMMANDS =====
client.on("messageCreate", async (message) => {
    if (!message.content.startsWith("!")) return;
    if (message.author.bot) return;

    const [cmd, ...args] = message.content.slice(1).split(" ");

    if (!ADMIN_IDS.includes(message.author.id)) {
        return message.reply("You do not have permission to use this bot.");
    }

    if (cmd === "key") {
        const sub = args[0];
        if (!sub) return message.reply("Usage: !key <add|delete|list> <key>");

        if (sub === "add") {
            const k = args[1];
            if (!k) return message.reply("Provide a key to add.");

            keys.set(k.trim(), { hwid: null, expires: null });
            message.reply(`Key \`${k.trim()}\` added.`);
            await logDiscord("🔑 Key Added", `Key: \`${k.trim()}\`\nBy: <@${message.author.id}>`);
        }

        else if (sub === "delete") {
            const k = args[1];
            if (!k) return message.reply("Provide a key to delete.");

            if (!keys.has(k.trim())) return message.reply("Key not found.");
            keys.delete(k.trim());
            message.reply(`Key \`${k.trim()}\` deleted.`);
            await logDiscord("🗑️ Key Deleted", `Key: \`${k.trim()}\`\nBy: <@${message.author.id}>`, 0xff0000);
        }

        else if (sub === "list") {
            if (keys.size === 0) return message.reply("No keys added yet.");
            const list = [...keys.keys()].join(", ");
            message.reply(`Keys:\n${list}`);
        }

        else {
            message.reply("Unknown subcommand. Use add, delete, list.");
        }
    }
});

// ===== EXPRESS ROBLOX AUTH =====
app.get("/v9/auth", async (req, res) => {
    let { k, hwid, experienceId } = req.query;
    if (!k || !hwid || !experienceId) return res.status(401).send("AUTH_FAIL");

    k = String(k).trim();

    if (!keys.has(k)) {
        return res.status(401).send("AUTH_FAIL");
    }

    const data = keys.get(k);

    // HWID lock
    if (data.hwid === null) {
        data.hwid = hwid;
        keys.set(k, data);
        await logDiscord("🔒 HWID Locked", `Key: \`${k}\`\nHWID: \`${hwid}\`\nExperienceId: \`${experienceId}\``);
    }

    if (data.hwid !== hwid) return res.status(401).send("AUTH_FAIL");

    return res.status(200).send("");
});

// ===== START =====
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Auth server running on port ${PORT}`));
client.login(BOT_TOKEN);
