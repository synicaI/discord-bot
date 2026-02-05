import { Client, GatewayIntentBits } from "discord.js";
import fetch from "node-fetch";

const BOT_TOKEN = process.env.BOT_TOKEN;
const AUTH_SERVER = "https://skillful-achievement-production-f080.up.railway.app";
const SECRET_KEY = "DQOWHDIUQWHIQUWHDWQIUDHQWIUDHQWHDQWIUFHQIFQ";
const ADMIN_ROLE_ID = "1461424207932948728";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on("messageCreate", async msg => {
  if (!msg.content.startsWith("!key")) return;
  if (!msg.member.roles.cache.has(ADMIN_ROLE_ID))
    return msg.reply("❌ Not admin");

  const [, action, key] = msg.content.split(" ");

  try {
    if (action === "add") {
      await fetch(`${AUTH_SERVER}/key/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: SECRET_KEY, key })
      });
      msg.reply(`✅ Key added`);
    }

    if (action === "delete") {
      await fetch(`${AUTH_SERVER}/key/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: SECRET_KEY, key })
      });
      msg.reply(`🗑️ Key deleted`);
    }

    if (action === "reset") {
      await fetch(`${AUTH_SERVER}/key/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: SECRET_KEY, key })
      });
      msg.reply(`🔁 HWID reset`);
    }

    if (action === "list") {
      const res = await fetch(
        `${AUTH_SERVER}/key/list?secret=${SECRET_KEY}`
      );
      const data = await res.json();
      msg.reply(
        data.length ? data.join("\n") : "No keys"
      );
    }
  } catch (e) {
    console.error(e);
    msg.reply("❌ Server error");
  }
});

client.login(BOT_TOKEN);
