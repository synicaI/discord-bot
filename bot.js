import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from "discord.js";
import fetch from "node-fetch";
import "dotenv/config";

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const API = "https://skillful-achievement-production-f080.up.railway.app";

const ADMIN_IDS = [
  "1001562621381714080",
  "1375016755822596096",
  "1389631531114430594",
  "1255892341206552607"
];

const commands = [
  new SlashCommandBuilder()
    .setName("keyadd")
    .setDescription("Add a key")
    .addStringOption(o => o.setName("key").setDescription("Key").setRequired(true)),

  new SlashCommandBuilder()
    .setName("keydelete")
    .setDescription("Delete a key")
    .addStringOption(o => o.setName("key").setDescription("Key").setRequired(true)),

  new SlashCommandBuilder()
    .setName("keylist")
    .setDescription("List keys")
].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);
await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (!ADMIN_IDS.includes(interaction.user.id)) {
        return interaction.reply({ content: "❌ No permission", ephemeral: true });
    }

    const headers = {
        "Content-Type": "application/json",
        "x-admin-id": interaction.user.id
    };

    if (interaction.commandName === "keyadd") {
        const key = interaction.options.getString("key");

        await fetch(`${API}/admin/key/add`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                key,
                admin: interaction.user.tag
            })
        });

        return interaction.reply({ content: `✅ Added \`${key}\``, ephemeral: true });
    }

    if (interaction.commandName === "keydelete") {
        const key = interaction.options.getString("key");

        await fetch(`${API}/admin/key/delete`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                key,
                admin: interaction.user.tag
            })
        });

        return interaction.reply({ content: `🗑 Deleted \`${key}\``, ephemeral: true });
    }

    if (interaction.commandName === "keylist") {
        const r = await fetch(`${API}/admin/key/list`, { headers });
        const data = await r.json();

        return interaction.reply({
            content: data.map(x => `• ${x[0]}`).join("\n") || "No keys",
            ephemeral: true
        });
    }
});

client.login(TOKEN);
