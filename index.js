const fetch = require("node-fetch");
const cheerio = require("cheerio");
const fs = require("fs");
const { setInterval } = require("timers");
const { exec } = require("child_process");
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
      console.log(`[${new Date().toISOString()}] Updated Data.`);
    });
};

getMedals();

function writeData(raw) {
  let data = { last_updated: Date.now(), medals: raw };
  fs.writeFileSync("./data.json", JSON.stringify(data), "utf8");
}