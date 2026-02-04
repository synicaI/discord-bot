import { Client, GatewayIntentBits } from "discord.js";
import fetch from "node-fetch";
import { keys } from "./index.js";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const PREFIX = "!key";

client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (msg) => {
  if (!msg.content.startsWith(PREFIX)) return;

  const args = msg.content.split(" ").slice(1);
  const sub = args.shift();

  // !key add KEY
  if (sub === "add") {
    const key = args[0];
    if (!key) return msg.reply("usage: !key add <key>");

    if (keys.has(key)) return msg.reply("key already exists");

    keys.set(key, { hwid: null });
    return msg.reply(`✅ key added: \`${key}\``);
  }

  // !key delete KEY
  if (sub === "delete") {
    const key = args[0];
    if (!key) return msg.reply("usage: !key delete <key>");

    if (!keys.has(key)) return msg.reply("key not found");

    keys.delete(key);
    return msg.reply(`🗑️ key deleted: \`${key}\``);
  }

  // !key reset KEY
  if (sub === "reset") {
    const key = args[0];
    if (!key) return msg.reply("usage: !key reset <key>");

    const entry = keys.get(key);
    if (!entry) return msg.reply("key not found");

    entry.hwid = null;
    keys.set(key, entry);
    return msg.reply(`♻️ HWID reset for: \`${key}\``);
  }

  // !key list
  if (sub === "list") {
    if (keys.size === 0) return msg.reply("no keys");

    let out = "";
    let i = 1;

    for (const [k, v] of keys.entries()) {
      out += `${i}. ${k} ${v.hwid ? "🔒" : "🟢"}\n`;
      i++;
    }

    return msg.reply("```" + out + "```");
  }

  msg.reply("usage: !key <add|delete|reset|list>");
});

client.login("YOUR_DISCORD_BOT_TOKEN");
