const { Client, GatewayIntentBits } = require("discord.js");

const TOKEN = process.env.BOT_TOKEN; // Railway env var
const ADMIN_ROLE_ID = "1461424207932948728";
const SERVER_URL = "https://skillful-achievement-production-f080.up.railway.app";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log(`🤖 Bot logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (!message.member.roles.cache.has(ADMIN_ROLE_ID)) {
    return message.reply("❌ You are not an admin.");
  }

  const args = message.content.trim().split(/\s+/);
  const cmd = args.shift()?.toLowerCase();

  if (cmd !== "!key") return;

  const action = args[0];
  const key = args[1];

  if (!action || !key) {
    return message.reply("Usage: `!key add <key>` | `!key delete <key>` | `!key list`");
  }

  try {
    if (action === "add") {
      await fetch(`${SERVER_URL}/admin/key/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key })
      });
      return message.reply(`✅ Key **${key}** added.`);
    }

    if (action === "delete") {
      await fetch(`${SERVER_URL}/admin/key/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key })
      });
      return message.reply(`🗑️ Key **${key}** deleted.`);
    }

    if (action === "list") {
      const res = await fetch(`${SERVER_URL}/admin/key/list`);
      const data = await res.json();
      return message.reply(
        Object.keys(data).length
          ? `📋 Keys:\n\`\`\`${Object.keys(data).join("\n")}\`\`\``
          : "No keys stored."
      );
    }

    message.reply("Unknown action.");

  } catch (err) {
    console.error(err);
    message.reply("❌ Error talking to auth server.");
  }
});

client.login(TOKEN);
