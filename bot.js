import { Client, GatewayIntentBits } from "discord.js";
import fetch from "node-fetch";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const BOT_TOKEN = process.env.BOT_TOKEN;
const API_URL = process.env.AUTH_URL;
const SECRET = process.env.SECRET_KEY;

const ALLOWED_USERS = [
  "1001562621381714080",
  "1375016755822596096",
  "1389631531114430594",
  "1255892341206552607"
];

async function call(path, body) {
  const res = await fetch(API_URL + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, secret: SECRET })
  });
  return res.text();
}

client.on("messageCreate", async msg => {
  if (!msg.content.startsWith("!key")) return;
  if (!ALLOWED_USERS.includes(msg.author.id))
    return msg.reply("❌ No permission");

  const [_, cmd, a, b] = msg.content.split(" ");

  if (cmd === "add") {
    if (!a) return msg.reply("Usage: !key add <key> [days]");
    const expires = b ? Date.now() + Number(b) * 86400000 : null;
    return msg.reply(await call("/admin/key/add", { key: a, expires }));
  }

  if (cmd === "reset") {
    return msg.reply(await call("/admin/key/reset", { key: a }));
  }

  if (cmd === "delete") {
    return msg.reply(await call("/admin/key/delete", { key: a }));
  }

  if (cmd === "list") {
    return msg.reply("```" + await call("/admin/key/list", {}) + "```");
  }
});

client.login(BOT_TOKEN);
