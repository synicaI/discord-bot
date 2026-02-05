import { Client, GatewayIntentBits } from "discord.js"
import fetch from "node-fetch"

// ENV VARIABLES (RAILWAY)
const TOKEN = process.env.DISCORD_TOKEN
const AUTH_SERVER = process.env.AUTH_SERVER
const SECRET_KEY = process.env.SECRET_KEY

if (!TOKEN || !AUTH_SERVER || !SECRET_KEY) {
    console.error("❌ Missing environment variables")
    process.exit(1)
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
})

client.on("ready", () => {
    console.log(`🤖 Logged in as ${client.user.tag}`)
})

client.on("messageCreate", async (message) => {
    if (message.author.bot) return
    if (!message.content.startsWith("!key")) return

    const args = message.content.trim().split(/\s+/)
    const sub = args[1]
    const key = args[2]

    try {
        // ───── ADD KEY
        if (sub === "add") {
            if (!key) return message.reply("❌ Provide a key")

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

        // ───── DELETE KEY
        if (sub === "delete") {
            if (!key) return message.reply("❌ Provide a key")

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

        // ───── RESET HWID
        if (sub === "reset") {
            if (!key) return message.reply("❌ Provide a key")

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

        // ───── LIST KEYS
        if (sub === "list") {
            const res = await fetch(
                `${AUTH_SERVER}/key/list?secret=${SECRET_KEY}`
            )

            const data = await res.json()

            let output = ""
            for (const k in data) {
                output += `${k} | HWID: ${data[k].hwid ?? "null"}\n`
            }

            if (output === "") output = "No keys"

            return message.reply("```" + output + "```")
        }

        return message.reply("❓ Usage: `!key add|delete|reset|list <key>`")
    } catch (err) {
        console.error(err)
        message.reply("❌ Server error")
    }
})

client.login(TOKEN)
