const PORT = process.env.PORT || 8000;
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const app = express();

const numberOfPage = 134;
const crypto = [];
const costs = [];
const allData = [];

//a.d-lg-none.font-bold.tw-w-12
let count = 0;
for (let i = 1; i < numberOfPage; i++) {
  axios
    .get(`https://www.coingecko.com/?page=${i}`)
    .then(function (response) {
      const html = response.data;
      let $ = cheerio.load(html);
      $("a.d-lg-none.font-bold.tw-w-12").each(function (i, element) {
        let cryptoName = $(element).text();
        let url = $(element).attr("href");
        crypto.push({
          cryptoName,
          url: `https://www.coingecko.com${url}`,
        });
      });

      $("td.td-price.price.text-right.pl-0 .no-wrap").each(function (
        i,
        element
      ) {
        let cost = $(element).text();
        costs.push({
          cost,
        });
      });

      for (; count < crypto.length; count++) {
        allData.push({
          cryptoName: crypto[count].cryptoName.trim(),
          url: crypto[count].url,
          cost: costs[count].cost,
        });
      }
    })
    .catch((err) => {
      console.log("err: " + err);
    });
}

app.get("/", function (req, res) {
  res.json("Welcome to Crypto Scraper");
});

app.get("/coins", function (req, res) {
  //   axios.get("https://www.coingecko.com/?page=6").then(function (response) {
  //     const html = response.data;
  //     const $ = cheerio.load(html);
  //     console.log("here");
  //     $("a.d-lg-none.font-bold.tw-w-12").each(function (i, element) {
  //       let cryptoName = $(element).text();
  //       let url = $(element).attr("href");
  //       crypto.push({
  //         cryptoName,
  //         url,
  //       });
  //     });
  //   });
  //   for (let i = 0; i < crypto.length; i++) {
  //     allData.push({
  //       cryptoName: crypto[i].cryptoName,
  //       url: crypto[i].url,
  //       cost: costs[i].cost,
  //     });
  //   }
  res.json(allData);
});

app.get("/coins/:coinname", async function (req, res) {
  try {
    let coinname = req.params.coinname.toUpperCase();
    let coin = allData.find((coin) => coin.cryptoName === coinname);
    let coinData = {};
    await axios
      .get(coin.url)
      .then(function (response) {
        const html = response.data;
        const $ = cheerio.load(html);
        let coinExtraData = [];
        $("table.table.b-b .tw-text-gray-900").each(function (i, element) {
          let extraData = $(element).text();
          coinExtraData.push({
            extraData,
          });
        });
        coinData.cryptoName = coin.cryptoName;
        coinData.cost = coin.cost;
        coinData.url = coin.url;
        coinData.marketCap = coinExtraData[1].extraData.trim();
        coinData.marketCapDominance = coinExtraData[2].extraData.trim();
        coinData.tradingVolume = coinExtraData[3].extraData.trim();
        coinData.volumeDividedMarketCap = coinExtraData[4].extraData.trim();
        coinData.Low24DividedHigh24 = coinExtraData[5].extraData.trim();
      })
      .catch((err) => {
        console.log("err: " + err);
      });
    res.json(coinData);
  } catch (err) {
    console.log(err);
  }
});

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`));
