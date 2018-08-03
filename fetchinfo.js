const Nightmare = require('nightmare');
const nightmare = Nightmare();

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
            fs.writeFileSync(`test${i}.txt`, util.inspect(dropsFrom[i].childNodes[0], { showHidden: true, depth: null}));
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
