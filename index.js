const fetch = require("node-fetch");
const cheerio = require("cheerio");
const fs = require("fs");
const actions = require("@actions/core");

const getMedals = () => {
  fetch(
    "https://olympics.com/tokyo-2020/olympic-games/en/results/all-sports/medal-standings.htm",
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
      },
    }
  )
    .then((response) => response.text())
    .then((html) => {
      const $ = cheerio.load(html);
      const rows = $("#medal-standing-table  tbody tr");
      const data = [];
      rows.each((i, row) => {
        const cells = $(row).find("td");
        const country = cells.eq(1).text().trim();
        const gold = parseInt(cells.eq(2).text().trim());
        const silver = parseInt(cells.eq(3).text().trim());
        const bronze = parseInt(cells.eq(4).text().trim());
        const total = parseInt(cells.eq(5).text().trim());
        const total_rank = parseInt(cells.eq(6).text().trim());
        data.push({
          country,
          gold,
          silver,
          bronze,
          total,
          total_rank,
        });
      });
      writeData(data);
      update_bio(data);
      console.log(`[${new Date().toISOString()}] Updated Data.`);
    });
};

getMedals();

function writeData(raw) {
  let data = { last_updated: Date.now(), medals: raw };
  fs.writeFileSync("./data.json", JSON.stringify(data), "utf8");
}
async function update_bio(raw) {
  const countries = raw
    .map((x) => x.country.replace("People's Republic of China", "China"))
    .map((x) => x.replace("United States of America", "United States"));
  const bio = `Olympics Stats (2020) : 
  1) ${countries[0]} 🥇 ${raw[0].gold} 🥈 ${raw[0].silver} 🥉 ${raw[0].bronze} |
  2) ${countries[1]} 🥇 ${raw[1].gold} 🥈 ${raw[1].silver} 🥉 ${raw[1].bronze} |
  3) ${countries[2]} 🥇 ${raw[2].gold} 🥈 ${raw[2].silver} 🥉 ${raw[2].bronze} |
  `;
  const data = await fetch("https://api.github.com/user", {
    method: "patch",
    headers: {
      Authorization: "token " + process.env["GITHUB_TOKEN"],
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ bio }),
  });
}
