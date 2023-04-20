const PORT = process.env.PORT || 8000;
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const app = express();

const numberOfPage = 10; // 10 pages
const crypto = [];
const costs = [];
const allData = [];

//heroku config:set NODE_OPTIONS="--max_old_space_size=2560" -a [app_name]
//a.d-lg-none.font-bold.tw-w-12
let count = 0;
for (let i = 1; i < numberOfPage; i++) {
  axios
    .get(`https://crypto.com/price?page=${i}`)
    .then(function (response) {
      const html = response.data;
      let $ = cheerio.load(html);

      
      $("tbody tr td a p").each(function (i, element) {
        let cryptoName = $(element).next().text();
        let url = $(element).parent().parent().parent().attr('href');
        //console.log(cryptoName)
        // console.log(url)
        crypto.push({
          cryptoName,
          url,
        });
      });

      $(".css-b1ilzc ").each(function (
        i,
        element
      ) {
        let cost = $(element).text();
        //console.log(cost);
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
     //console.log(allData)
     })
    .catch((err) => {
      console.log("err: " + err);
    });
}


app.get("/", function (req, res) {
  res.json("Welcome to Crypto Coins API");
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
      .get(`https://crypto.com${coin.url}`)
      .then(function (response) {
        const html = response.data;
        const $ = cheerio.load(html);
        let coinExtraData = [];
        $(".chakra-stat dl dd").each(function (i, element) {
          let extraData = $(element).text();
          console.log(extraData);
          coinExtraData.push({
            extraData,
          });
        });
        coinData.cryptoName = coin.cryptoName;
        coinData.cost = coin.cost;
        coinData.url = coin.url;
        coinData.numberOfCoins = coinExtraData[0].extraData.trim();
        coinData.marketCap = coinExtraData[1].extraData.trim();
        coinData.volume24 = coinExtraData[3].extraData.trim();
        coinData.ethGas = coinExtraData[5].extraData.trim();
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
