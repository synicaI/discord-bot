const { Client, GatewayIntentBits } = require("discord.js");
const { keys } = require("./index"); // shared keys object

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers, // <--- Needed to check roles
  ],
});

const PREFIX = "!";
const ADMIN_ROLE_ID = "1461424207932948728";

client.on("ready", () => {
  console.log(`Bot logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;
  if (!msg.content.startsWith(PREFIX)) return;

  // Fetch member to ensure roles are available
  const member = await msg.guild.members.fetch(msg.author.id);

  if (!member.roles.cache.has(ADMIN_ROLE_ID))
    return msg.reply("❌ You are not an admin!");

  const args = msg.content.slice(PREFIX.length).trim().split(/ +/);
  const cmd = args.shift()?.toLowerCase();

  if (cmd === "key" && args[0] === "add") {
    const key = args[1];
    if (!key) return msg.reply("❌ Missing key");

    keys[key] = { hwid: null, expires: null };
    return msg.reply(`✅ Key added:\n\`${key}\``);
  }

  if (cmd === "key" && args[0] === "delete") {
    const key = args[1];
    if (!keys[key]) return msg.reply("❌ Key not found");

    delete keys[key];
    return msg.reply(`🗑️ Key deleted:\n\`${key}\``);
  }

  if (cmd === "key" && args[0] === "list") {
    const list = Object.keys(keys);
    if (!list.length) return msg.reply("No keys.");

    return msg.reply("**Keys:**\n" + list.map((k) => `\`${k}\``).join("\n"));
  }

  if (cmd === "key" && args[0] === "reset") {
    const key = args[1];
    if (!keys[key]) return msg.reply("❌ Key not found");

    keys[key].hwid = null;
    return msg.reply(`🔄 HWID reset for:\n\`${key}\``);
  }
});

client.login(process.env.DISCORD_TOKEN);
