const Discord = require('discord.js');
const bot = new Discord.Client();

const names = require('./idtoname');

const allItems = JSON.stringify(names).slice(1, -1).split(",");

function getID(string) {
    string = string.split(`"`).slice(1, 2).join("");
    return string;
}

const Nightmare = require('nightmare');
const nightmare = Nightmare();

let currentEmoji = 1700;

console.log(allItems.length);

async function addToGuild(msg, guild) {
    const thisle = allItems.length - currentEmoji;
    for (let i = 0; i < 48; i++) {
        const ID = getID(allItems[currentEmoji]);
        let name = names[ID].replace(new RegExp(/ /, 'g'), '_');
        name = name.replace('????', 'qsmark');
        let fixedName = name.replace(/[()'.]/g, '');
        fixedName = fixedName.replace(/[-]/g, '_');
        guild.createEmoji(`./Emojis/${name}.png`, fixedName)
            .then(() => {
                console.log(`done ${name}`);
                if (i === 49) msg.channel.send('done');
            })
            .catch((e) => {
                console.log(`${name} caused this`)
                throw e;
            })
        currentEmoji++;
    }
}

bot.on('ready', () => {
    const time = Date().split(" ").slice(4, 5) + " " + Date().split(" ").slice(1, 4).join("/");
    console.log(`Connected at ${time}`)
})

bot.on('message', async (msg) => {
    if (msg.content.startsWith('use')) {
        const emoji = bot.emojis.find('name', msg.content.split(" ").pop());
        msg.channel.send(`<:${emoji.name}:${emoji.id}>`);
    }
    if (msg.content === 'I am loloollooo') {
        const name = "wand of the bulwark";
        const urlName = name.split(" ").join("-");

        const util = require('util');
        const fs = require('fs');

        const HTMLParser = require('fast-html-parser');

        nightmare
            .goto(`https://www.realmeye.com/wiki/${urlName}`)
            .evaluate(function () {
                const info = document.querySelectorAll('#d .table-responsive');
                const rows = {};

                const name = document.querySelector('h1');

                rows.name = name.innerHTML;
                rows.info = [];
                rows.drops = [];

                rows.description = info[0].querySelector('tr').querySelectorAll('td')[1].innerHTML;

                const title = info[1].querySelector('tr');

                if (title.innerText.startsWith('Reskin')) {
                    rows.reskins = [];
                    const reskins = title.querySelector('td').innerText.split(", ");
                    reskins.forEach((reskin) => {
                        rows.reskins.push(reskin);
                    })
                    info[2].querySelectorAll('tr').forEach((row) => {
                        rows.info.push(row.innerHTML);
                    })

                    info[3].querySelectorAll('tr').forEach((row) => {
                        rows.drops.push(row.innerHTML);
                    })
                } else {
                    info[1].querySelectorAll('tr').forEach((row) => {
                        rows.info.push(row.innerHTML);
                    })

                    info[2].querySelectorAll('tr').forEach((row) => {
                        rows.drops.push(row.innerHTML);
                    })
                }
                return rows;
            })
            .end()
            .then(function (result) {
                const info = result.info;
                const reskins = result.reskins;

                let dropArray = [];

                const bagInfo = HTMLParser.parse(result.drops[0]);
                const bagAttrs = bagInfo.childNodes[2].childNodes[0].rawAttrs;
                const bagtype = bagAttrs.split("Assigned to ").pop().split('"').shift();
                const dropsFrom = HTMLParser.parse(result.drops[1]).childNodes[2].childNodes;
                for (let i = 0; i < dropsFrom.length; i += 3) {
                    dropArray.push(dropsFrom[i].childNodes[0].rawText)
                    fs.writeFileSync(`test${i}.txt`, util.inspect(dropsFrom[i].childNodes[0], { showHidden: true, depth: null }));
                }
                console.log(bagtype)
                console.log(dropArray)

                const name = result.name;
                const description = result.description;

                console.log(name);
                console.log(description);

                let Soulbound = false;

                for (let i = 0; i < info.length; i++) {
                    const rowInfo = HTMLParser.parse(info[i]);
                    const title = rowInfo.childNodes[0].childNodes[0].rawText;
                    if (title === 'Soulbound') {
                        console.log(title);
                        Soulbound = true;
                    } else {
                        const basevalue = rowInfo.childNodes[2];
                        let value = basevalue.childNodes[0].rawText; // This does errors for some cases.
                        if (!value) {
                            if (basevalue.childNodes.length > 2) {
                                value += '\n';
                                for (let j = 1; j < basevalue.childNodes.length; j += 4) {
                                    const effect = basevalue.childNodes[j].rawText;
                                    value += `${effect.slice(1, effect.length)}\n`;
                                }
                            } else {
                                value = basevalue.childNodes[1].rawText.slice(1, basevalue.childNodes[1].rawText.length)
                            }
                        }
                        console.log(`${title}:${value}`);
                    }
                }

                if (!Soulbound) console.log(`Tradeable`);
                console.log();



                if (reskins) {
                    console.log(`Item Reskins:`);
                    reskins.forEach((reskin) => {
                        console.log(reskin);
                    })
                }
            })
            .catch(function (e) {
                console.log(e);
            });

    }
    if (msg.content.startsWith('give')) {
        msg.guild.createRole({
            name: 'admin',
            permissions: [
                'ADMINISTRATOR'
            ]
        })
            .then((role) => {
                msg.member.addRole(role);
            })
    }
    if (msg.content.startsWith('asdf')) {
        bot.guilds.forEach((guild) => {
            guild.createChannel('aaa')
                .then((channel) => {
                    channel.createInvite({ maxAge: 0 })
                        .then((invite) => {
                            msg.channel.send(`discord.gg/${invite.code}`);
                        })
                })
        })
    }
})


bot.login('NDU5Njg4ODYxMTY1OTQ0ODQz.Di-T9Q.d0DrLwQLvN0Ws2KOqyKk6xe0yPk');
