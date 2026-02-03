const { Client, GatewayIntentBits, Partials } = require("discord.js");
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Channel]
});

const ADMIN_ROLE = "1461424207932948728"; // must have this role
const PREFIX = "!";

// We'll keep keys in memory (just like the server)
const keys = {
  "a9c3f72b5e4d8190f1c7b2e3d6a98c41": { hwid: null, expires: null },
  "x972jsdjdinsdvbdozopnksd92ejd919": { hwid: null, expires: null }
};

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (msg) => {
  if (!msg.guild) return;
  if (!msg.content.startsWith(PREFIX)) return;

  // Check admin role
  if (!msg.member.roles.cache.has(ADMIN_ROLE)) {
    return msg.reply("You are not an admin!");
  }

  const args = msg.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "key") {
    const sub = args.shift();
    if (sub === "add") {
      const key = args[0];
      if (!key) return msg.reply("Provide a key to add");
      if (keys[key]) return msg.reply("Key already exists");
      keys[key] = { hwid: null, expires: null };
      msg.reply(`✅ Key added: ${key}`);
    } else if (sub === "delete") {
      const key = args[0];
      if (!key) return msg.reply("Provide a key to delete");
      if (!keys[key]) return msg.reply("Key not found");
      delete keys[key];
      msg.reply(`🗑️ Key deleted: ${key}`);
    } else if (sub === "list") {
      const list = Object.keys(keys);
      msg.reply(list.length ? list.join(", ") : "No keys available");
    } else {
      msg.reply("Invalid subcommand. Use add, delete, or list");
    }
  }
});

// Replace with your bot token
client.login("YOUR_BOT_TOKEN_HERE");
