import { Client, GatewayIntentBits } from "discord.js";
import fetch from "node-fetch";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const ADMIN_ROLE_ID = "1461424207932948728";
const AUTH_SERVER = "https://skillful-achievement-production-f080.up.railway.app";
const SECRET_KEY = "DQOWHDIUQWHIQUWHDWQIUDHQWIUDHQWHDQWIUFHQIFQ";

client.on("messageCreate", async (msg) => {
  if (!msg.content.startsWith("!key")) return;
  if (!msg.member.roles.cache.has(ADMIN_ROLE_ID))
    return msg.reply("❌ Not admin");

  const [_, action, key] = msg.content.split(" ");
  if (!action || !key) return msg.reply("Usage: !key <add|delete|reset|list> [key]");

  let res;
  try {
    if (action === "list") {
      res = await fetch(`${AUTH_SERVER}/key/list`, {
        headers: { "x-secret": SECRET_KEY }
      });
    } else {
      res = await fetch(`${AUTH_SERVER}/key/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-secret": SECRET_KEY
        },
        body: JSON.stringify({ key })
      });
    }

    const data = await res.json();
    msg.reply("✅ " + JSON.stringify(data));
  } catch (e) {
    msg.reply("❌ Server error");
  }
});

client.login(process.env.BOT_TOKEN);
