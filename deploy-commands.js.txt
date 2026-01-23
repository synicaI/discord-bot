import { REST, Routes, SlashCommandBuilder } from "discord.js";

const commands = [
  new SlashCommandBuilder()
    .setName("panel")
    .setDescription("Open key management panel")
    .toJSON()
];

const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

await rest.put(
  Routes.applicationCommands(process.env.APP_ID),
  { body: commands }
);

console.log("Commands registered");
