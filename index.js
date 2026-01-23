import { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import axios from "axios";

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const API_URL = process.env.API_URL;
const ADMIN_SECRET = process.env.ADMIN_SECRET;
const BOT_TOKEN = process.env.BOT_TOKEN;

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);
});

/* Slash command logic */
client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand() && interaction.commandName === "panel") {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("add").setLabel("➕ Add Key").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId("delete").setLabel("❌ Delete Key").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId("generate").setLabel("📋 Generate Key").setStyle(ButtonStyle.Primary)
    );

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("🔐 Key Management Panel")
          .setDescription("Use buttons to manage keys")
      ],
      components: [row],
      ephemeral: true
    });
  }

  if (interaction.isButton() && interaction.customId === "generate") {
    const res = await axios.get(`${API_URL}/admin/create-key`, {
      params: { secret: ADMIN_SECRET }
    });

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("✅ Key Generated")
          .setDescription(`\`\`\`${res.data.key}\`\`\``)
      ],
      ephemeral: true
    });
  }
});

client.login(BOT_TOKEN);
