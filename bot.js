import { Client, GatewayIntentBits } from "discord.js";
import { keys } from "./store.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (msg) => {
  if (!msg.content.startsWith("!key")) return;

  const args = msg.content.split(" ").slice(1);
  const cmd = args.shift();

  if (cmd === "add") {
    const key = args[0];
    if (!key) return msg.reply("usage: !key add <key>");
    if (keys.has(key)) return msg.reply("key already exists");

    keys.set(key, { hwid: null });
    return msg.reply(`✅ key added: \`${key}\``);
  }

  if (cmd === "delete") {
    const key = args[0];
    if (!keys.has(key)) return msg.reply("key not found");

    keys.delete(key);
    return msg.reply(`🗑️ key deleted: \`${key}\``);
  }

  if (cmd === "reset") {
    const key = args[0];
    const entry = keys.get(key);
    if (!entry) return msg.reply("key not found");

    entry.hwid = null;
    return msg.reply(`♻️ HWID reset for \`${key}\``);
  }

  if (cmd === "list") {
    if (keys.size === 0) return msg.reply("no keys");

    let out = "";
    let i = 1;
    for (const [k, v] of keys) {
      out += `${i}. ${k} ${v.hwid ? "🔒" : "🟢"}\n`;
      i++;
    }

    return msg.reply("```" + out + "```");
  }

  msg.reply("usage: !key <add|delete|reset|list>");
});

client.login("YOUR_DISCORD_BOT_TOKEN");
