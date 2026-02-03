const { Client, GatewayIntentBits } = require("discord.js");
const fetch = require("node-fetch");

const TOKEN = process.env.BOT_TOKEN; // your Discord bot token
const ADMIN_ROLE = "1461424207932948728"; // admin role required to use commands
const SERVER_URL = "https://skillful-achievement-production-f080.up.railway.app/"; // replace with your server URL if hosted

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (!message.member.roles.cache.has(ADMIN_ROLE)) {
    return message.reply("❌ You are not an admin");
  }

  const args = message.content.split(" ");
  const cmd = args.shift().toLowerCase();

  if (cmd === "!key") {
    const sub = args.shift();
    const key = args.shift();

    if (!sub || !key) return message.reply("Usage: !key add|delete <key>");

    if (sub === "add") {
      await fetch(`${SERVER_URL}/admin/key/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key })
      });
      message.reply(`✅ Key ${key} added.`);
    } else if (sub === "delete") {
      await fetch(`${SERVER_URL}/admin/key/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key })
      });
      message.reply(`🗑️ Key ${key} deleted.`);
    } else if (sub === "list") {
      const res = await fetch(`${SERVER_URL}/admin/key/list`);
      const data = await res.json();
      message.reply("📋 Keys: " + Object.keys(data).join(", "));
    } else {
      message.reply("Unknown subcommand");
    }
  }
});

client.login(TOKEN);
