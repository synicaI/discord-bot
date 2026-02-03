const { Client, GatewayIntentBits, Partials } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

const DISCORD_BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ROLE_ID = "1461424207932948728"; // Only users with this role can use commands

// Keys stored in memory
const keys = {};

client.on("ready", () => {
  console.log(`Bot logged in as ${client.user.tag}`);
});

client.on("messageCreate", async message => {
  if (message.author.bot) return;
  if (!message.member.roles.cache.has(ADMIN_ROLE_ID)) {
    return message.reply("❌ You are not an admin!");
  }

  const args = message.content.trim().split(/\s+/);
  const cmd = args.shift().toLowerCase();

  if (cmd === "!key") {
    const sub = args.shift()?.toLowerCase();
    if (sub === "add") {
      const key = args[0];
      if (!key) return message.reply("❌ Provide a key to add.");
      keys[key] = { hwid: null, expires: null };
      return message.reply(`✅ Key **${key}** added.`);
    } else if (sub === "delete") {
      const key = args[0];
      if (!key || !keys[key]) return message.reply("❌ Key not found.");
      delete keys[key];
      return message.reply(`🗑️ Key **${key}** deleted.`);
    } else if (sub === "list") {
      if (Object.keys(keys).length === 0) return message.reply("No keys found.");
      const list = Object.entries(keys)
        .map(([k, v]) => `• ${k} | HWID: ${v.hwid ?? "None"} | Expires: ${v.expires ?? "None"}`)
        .join("\n");
      return message.reply(`📃 **Keys:**\n${list}`);
    } else {
      return message.reply("❌ Invalid subcommand. Use add/delete/list.");
    }
  }
});

client.login(DISCORD_BOT_TOKEN);
