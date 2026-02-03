const { Client, GatewayIntentBits } = require("discord.js");
const { keys } = require("./index");

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ROLE_ID = "1461424207932948728";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

function isAdmin(member) {
  return member.roles.cache.has(ADMIN_ROLE_ID);
}

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;
  if (!msg.content.startsWith("!key")) return;

  if (!isAdmin(msg.member)) {
    return msg.reply("❌ You are not an admin.");
  }

  const args = msg.content.split(" ").slice(1);
  const sub = args[0];

  // ================= ADD =================
  if (sub === "add") {
    const key = args[1];
    if (!key) return msg.reply("Usage: `!key add <key>`");

    keys[key] = { hwid: null, expires: null };
    return msg.reply(`✅ Key **${key}** added.`);
  }

  // ================= DELETE =================
  if (sub === "delete") {
    const key = args[1];
    if (!keys[key]) return msg.reply("❌ Key not found.");

    delete keys[key];
    return msg.reply(`🗑️ Key **${key}** deleted.`);
  }

  // ================= LIST =================
  if (sub === "list") {
    const list = Object.keys(keys);

    if (list.length === 0) {
      return msg.reply("No keys found.");
    }

    return msg.reply(
      "**🔑 Keys:**\n```" + list.join("\n") + "```"
    );
  }

  // ================= HWID RESET =================
  if (sub === "hwid" && args[1] === "reset") {
    const key = args[2];
    if (!keys[key]) return msg.reply("❌ Key not found.");

    keys[key].hwid = null;
    return msg.reply(`🔁 HWID reset for **${key}**`);
  }

  msg.reply(
    "Usage:\n" +
    "`!key add <key>`\n" +
    "`!key delete <key>`\n" +
    "`!key list`\n" +
    "`!key hwid reset <key>`"
  );
});

client.login(BOT_TOKEN);
