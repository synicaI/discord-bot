import { Client, GatewayIntentBits } from "discord.js"
import fetch from "node-fetch"

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
})

const TOKEN = "PUT_YOUR_DISCORD_BOT_TOKEN_HERE"
const AUTH_SERVER = "https://skillful-achievement-production-f080.up.railway.app"
const SECRET_KEY = "DQOWHDIUQWHIQUWHDWQIUDHQWIUDHQWHDQWIUFHQIFQ"

client.on("messageCreate", async (message) => {
    if (!message.content.startsWith("!key") || message.author.bot) return

    const args = message.content.split(" ")
    const sub = args[1]
    const key = args[2]

    try {
        if (sub === "add") {
            await fetch(`${AUTH_SERVER}/key/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": SECRET_KEY
                },
                body: JSON.stringify({ key })
            })
            return message.reply(`✅ Key **${key}** added`)
        }

        if (sub === "delete") {
            await fetch(`${AUTH_SERVER}/key/delete`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": SECRET_KEY
                },
                body: JSON.stringify({ key })
            })
            return message.reply(`🗑️ Key **${key}** deleted`)
        }

        if (sub === "reset") {
            await fetch(`${AUTH_SERVER}/key/reset`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": SECRET_KEY
                },
                body: JSON.stringify({ key })
            })
            return message.reply(`♻️ HWID reset for **${key}**`)
        }

        if (sub === "list") {
            const res = await fetch(`${AUTH_SERVER}/key/list?secret=${SECRET_KEY}`)
            const data = await res.json()

            let out = ""
            for (const k in data) {
                out += `${k} | HWID: ${data[k].hwid ?? "null"}\n`
            }

            return message.reply("```" + out + "```")
        }
    } catch (e) {
        console.error(e)
        message.reply("❌ Server error")
    }
})

client.login(TOKEN)
