import { Client, GatewayIntentBits } from "discord.js";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const ADMIN_ROLE = "1461424207932948728";
const API = "https://skillful-achievement-production-f080.up.railway.app";

client.on("messageCreate", async (msg) => {
  if (!msg.content.startsWith("!key")) return;
  if (!msg.member.roles.cache.has(ADMIN_ROLE))
    return msg.reply("❌ Not admin");

  const args = msg.content.split(" ");
  const sub = args[1];

  if (sub === "add") {
    const key = args[2];
    const r = await fetch(`${API}/bot/key/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key })
    }).then(r => r.json());

    return msg.reply(r.ok ? `✅ Key ${key} added` : "❌ Failed");
  }

  if (sub === "list") {
    const list = await fetch(`${API}/bot/key/list`).then(r => r.json());
    return msg.reply(list.length ? list.join("\n") : "No keys");
  }

  if (sub === "hwid" && args[2] === "reset") {
    const key = args[3];
    const r = await fetch(`${API}/bot/key/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key })
    }).then(r => r.json());

    return msg.reply(r.ok ? "🔓 HWID reset" : "❌ Key not found");
  }
});

client.login(process.env.BOT_TOKEN);
