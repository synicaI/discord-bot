import express from "express";
import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";

// ================== CONFIG ==================
const BOT_TOKEN = process.env.BOT_TOKEN; // Your bot token
const LOG_CHANNEL_ID = "1467847883456778358";
const PORT = process.env.PORT || 8080;

// ================== DISCORD BOT ==================
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

async function logAction(title, fields) {
  if (!client.isReady()) return;
  const channel = await client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setColor(0x2b2d31)
    .setTimestamp();

  for (const field of fields) {
    embed.addFields({ name: field.name, value: field.value, inline: field.inline ?? true });
  }

  channel.send({ embeds: [embed] }).catch(() => {});
}

client.once("ready", () => {
  console.log(`Discord bot logged in as ${client.user.tag}`);
});
client.login(BOT_TOKEN);

// ================== EXPRESS SERVER ==================
const app = express();
app.use(express.json());

// ================== KEYS ==================
const keys = new Map();

// ================== ADMIN ROUTES ==================
app.post("/admin/key/add", async (req, res) => {
  const { key, admin } = req.body;
  if (!key) return res.status(400).send("Missing key");

  keys.set(key, { hwid: null, expires: null });

  await logAction("🔑 Key Added", [
    { name: "Key", value: key },
    { name: "By", value: admin ?? "Unknown" },
  ]);

  res.send("OK");
});

app.post("/admin/key/delete", async (req, res) => {
  const { key, admin } = req.body;
  if (!keys.has(key)) return res.status(404).send("Not found");

  keys.delete(key);

  await logAction("🗑️ Key Deleted", [
    { name: "Key", value: key },
    { name: "By", value: admin ?? "Unknown" },
  ]);

  res.send("OK");
});

app.get("/admin/key/list", (req, res) => {
  res.json([...keys.entries()]);
});

// ================== ROBLOX AUTH ==================
app.get("/v9/auth", async (req, res) => {
  const { k, hwid, experienceId } = req.query;

  if (!k || !hwid || !experienceId) return res.status(401).send("AUTH_FAIL");

  if (!keys.has(k)) return res.status(401).send("AUTH_FAIL");

  const data = keys.get(k);

  // HWID lock
  if (data.hwid === null) {
    data.hwid = hwid;
    keys.set(k, data);

    await logAction("🔒 HWID Locked", [
      { name: "Key", value: k },
      { name: "HWID", value: hwid },
      { name: "ExperienceId", value: experienceId },
    ]);
  }

  if (data.hwid !== hwid) return res.status(401).send("AUTH_FAIL");

  res.status(200).send("");
});

// ================== START SERVER ==================
app.listen(PORT, () => {
  console.log(`Auth server running on port ${PORT}`);
});
