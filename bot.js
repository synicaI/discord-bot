const { Client, GatewayIntentBits } = require("discord.js");

const TOKEN = process.env.BOT_TOKEN;
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
  if (!message.content.startsWith("!key")) return;

  // Role check
  if (!message.member.roles.cache.has(ADMIN_ROLE_ID)) {
    return message.reply("❌ You are not an admin.");
  }

  const args = message.content.trim().split(/\s+/);
  // args[0] = !key
  const action = args[1];
  const key = args[2];

  // ===== LIST =====
  if (action === "list") {
    try {
      const res = await fetch(`${SERVER_URL}/admin/key/list`);
      const data = await res.json();

      if (!data || Object.keys(data).length === 0) {
        return message.reply("📭 No keys stored.");
      }

      return message.reply(
        `📋 Keys:\n\`\`\`${Object.keys(data).join("\n")}\`\`\``
      );
    } catch (err) {
      console.error(err);
      return message.reply("❌ Failed to fetch key list.");
    }
  }

  // From here on, ADD / DELETE REQUIRE a key
  if (!action || !key) {
    return message.reply(
      "Usage:\n`!key add <key>`\n`!key delete <key>`\n`!key list`"
    );
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

    return message.reply("❌ Unknown action.");

  } catch (err) {
    console.error(err);
    return message.reply("❌ Error talking to auth server.");
  }
});

client.login(TOKEN);
