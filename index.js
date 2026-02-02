// ================= DISCORD BOT =================
import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";

const DISCORD_TOKEN = process.env.DISCORD_TOKEN; // your bot token
const LOG_CHANNEL_ID = "1467847883456778358"; // channel for logging
const ALLOWED_USERS = [ // hardcoded allowed user IDs
  "1001562621381714080",
  "1375016755822596096",
  "1389631531114430594",
  "1255892341206552607"
];

if (!DISCORD_TOKEN) {
    console.error("Discord token not set in DISCORD_TOKEN");
    process.exit(1);
}

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// Helper: send embed logs
async function logAction(title, fields) {
    const channel = await client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
    if (!channel?.isTextBased()) return;

    const embed = new EmbedBuilder()
        .setTitle(title)
        .setColor(0x2b2d31)
        .addFields(fields)
        .setTimestamp(new Date());

    channel.send({ embeds: [embed] });
}

client.on("messageCreate", async (message) => {
    if (message.author.bot) return; // ignore bots
    if (!ALLOWED_USERS.includes(message.author.id)) {
        return message.reply("❌ You are not allowed to use this command.");
    }

    const args = message.content.trim().split(/\s+/);
    const cmd = args.shift().toLowerCase();

    // ===== KEY ADD =====
    if (cmd === "!key" && args[0] === "add") {
        const key = args[1];
        if (!key) return message.reply("❌ Usage: !key add <key>");

        if (keys.has(key)) return message.reply("❌ Key already exists.");
        keys.set(key, { hwid: null, expires: null });

        await logAction("🔑 Key Added", [
            { name: "Key", value: key, inline: true },
            { name: "By", value: message.author.tag, inline: true }
        ]);

        return message.reply(`✅ Key \`${key}\` added successfully.`);
    }

    // ===== KEY DELETE =====
    if (cmd === "!key" && args[0] === "delete") {
        const key = args[1];
        if (!key) return message.reply("❌ Usage: !key delete <key>");

        if (!keys.has(key)) return message.reply("❌ Key not found.");
        keys.delete(key);

        await logAction("🗑️ Key Deleted", [
            { name: "Key", value: key, inline: true },
            { name: "By", value: message.author.tag, inline: true }
        ]);

        return message.reply(`✅ Key \`${key}\` deleted successfully.`);
    }

    // ===== KEY LIST =====
    if (cmd === "!key" && args[0] === "list") {
        if (keys.size === 0) return message.reply("⚠️ No keys in the system.");
        const list = [...keys.keys()].join(", ");
        return message.reply(`🔑 Keys: ${list}`);
    }
});

client.once("ready", () => {
    console.log(`Discord bot logged in as ${client.user.tag}`);
});

client.login(DISCORD_TOKEN);
