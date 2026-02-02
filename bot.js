import { Client, GatewayIntentBits } from "discord.js";
import fetch from "node-fetch";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const ADMINS = new Set([
    "1001562621381714080",
    "1375016755822596096",
    "1389631531114430594",
    "1255892341206552607"
]);

const API = "https://skillful-achievement-production-f080.up.railway.app";
const PREFIX = "!key";

client.on("messageCreate", async (msg) => {
    if (!msg.content.startsWith(PREFIX)) return;
    if (!ADMINS.has(msg.author.id)) return;

    const args = msg.content.split(" ").slice(1);
    const sub = args.shift();

    if (sub === "add") {
        const key = args[0];
        if (!key) return;

        await fetch(API + "/admin/key/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                key,
                admin: `${msg.author.tag} (${msg.author.id})`
            })
        });

        msg.reply("✅ Key added");
    }

    if (sub === "delete") {
        const key = args[0];
        if (!key) return;

        await fetch(API + "/admin/key/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                key,
                admin: `${msg.author.tag} (${msg.author.id})`
            })
        });

        msg.reply("🗑️ Key deleted");
    }

    if (sub === "list") {
        const r = await fetch(API + "/admin/key/list");
        const data = await r.json();

        if (!data.length) {
            msg.reply("No keys");
            return;
        }

        msg.reply(
            data.map(([k, v]) => `${k} | HWID: ${v.hwid ?? "null"}`).join("\n")
        );
    }
});

client.login(process.env.BOT_TOKEN);
