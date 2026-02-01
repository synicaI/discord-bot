import { Client, GatewayIntentBits } from "discord.js";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const AUTH_SERVER = process.env.AUTH_SERVER;
const SECRET_KEY = process.env.SECRET_KEY;
const ALLOWED_ROLE = process.env.ALLOWED_ROLE;

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith("!key")) return;

  // Check role
  if (!message.member.roles.cache.has(ALLOWED_ROLE)) {
    return message.reply("You do not have permission to use this command.");
  }

  const args = message.content.split(" ");
  const cmd = args[1];

  try {
    if (cmd === "add") {
      const key = args[2];
      const hwid = args[3] || null;
      const expires = args[4] || null;

      const res = await fetch(`${AUTH_SERVER}/admin/key`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: SECRET_KEY, key, hwid, expires })
      });
      message.channel.send(await res.text());

    } else if (cmd === "delete") {
      const key = args[2];
      const res = await fetch(`${AUTH_SERVER}/admin/key`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: SECRET_KEY, key })
      });
      message.channel.send(await res.text());

    } else if (cmd === "reset-hwid") {
      const key = args[2];
      const res = await fetch(`${AUTH_SERVER}/reset-hwid?k=${key}&secret=${SECRET_KEY}`);
      message.channel.send(await res.text());

    } else if (cmd === "list") {
      const res = await fetch(`${AUTH_SERVER}/admin/keys?secret=${SECRET_KEY}`);
      const data = await res.json();
      let output = "Keys:\n";
      for (const k in data) {
        output += `${k} → HWID: ${data[k].hwid || "none"}, Expires: ${data[k].expires || "none"}\n`;
      }
      message.channel.send("```" + output + "```");

    } else {
      message.channel.send("Unknown command.");
    }
  } catch (err) {
    console.error(err);
    message.channel.send("Error occurred while processing your request.");
  }
});

client.login(process.env.DISCORD_TOKEN);
