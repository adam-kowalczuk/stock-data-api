const cheerio = require("cheerio");
const app = require("express")();
const port = process.env.PORT || 8008;

app.use(require("cors")());

app.get("/", (req, res) => {
  res.status(200).send("<h1>Stock Data API</h1>");
});

app.get("/:ticker", async (req, res) => {
  const { ticker } = req.params;
  const { key } = req.query;

  if (!ticker || !key) {
    return res.status(400).send({ message: "Please provide key and ticker" });
  }

  try {
    const stockInfo = await Promise.all(
      ["key-statistics", "history"].map(async (type) => {
        const url = `https://finance.yahoo.com/quote/${ticker}/${type}`;

        const response = await fetch(url);
        const data = await response.text();
        const $ = cheerio.load(data);

        if (type === "history") {
          const prices = $("td:nth-child(6)")
            .get()
            .map((val) => $(val).text());
          return { prices };
        }

        if (type === "key-statistics") {
          const metrics = [
            "Market Cap (intraday)",
            "Trailing P/E",
            "Forward P/E",
            "PEG Ratio (5 yr expected)",
            "Price/Sales (ttm)",
            "Price/Book (mrq)",
            "Enterprise Value/Revenue",
            "Enterprise Value/EBITDA",
            "Shares Outstanding5",
            "Profit Margin",
            "Operating Margin (ttm)",
            "Return on Assets (ttm)",
            "Return on Equity (ttm)",
            "Revenue (ttm)",
            "Revenue Per Share (ttm)",
            "Quarterly Revenue Growth (yoy)",
            "Gross Profit (ttm)",
            "EBITDA",
            "Net Income Avi to Common (ttm)",
            "Quarterly Earnings Growth (yoy)",
            "Total Cash (mrq)",
            "Total Debt (mrq)",
            "Total Debt/Equity (mrq)",
            "Operating Cash Flow (ttm)"
          ];

          // const stats = $(
          //   'section[data-test="qsp-statistics"] > div:nth-child(2) tr'
          // )
          //   .get()
          //   .map((val) => $(val).text())
          //   .reduce((acc, curr) => {
          //     const includedCheck = metrics.reduce((acc, curr2) => {
          //       if (acc === true) return true;
          //       return curr.includes(curr2);
          //     }, false);
          //     if (includedCheck) {
          //       const title = metrics.reduce((acc, curr2) => {
          //         if (curr.includes(curr2)) {
          //           return curr2;
          //         }
          //         return acc;
          //       }, "");
          //       return { ...acc, [title]: curr.replace(title, "") };
          //     } else {
          //       return acc;
          //     }
          //   }, {});

          // return { stats };
          const stats = $(
            'section[data-test="qsp-statistics"] > div:nth-child(3) tr'
          )
            .get()
            .map((val) => {
              const $ = cheerio.load(val);
              const keyVals = $("td")
                .get()
                .splice(0, 2)
                .map((val) => $(val).text());
              return keyVals;
            })
            .reduce((acc, curr) => {
              if (curr.length < 1) {
                return acc;
              }

              const includedCheck = metrics.reduce((acc, curr2) => {
                if (acc === true) {
                  return true;
                }
                return curr[0].includes(curr2);
              }, false);

              if (!includedCheck) {
                return acc;
              }

              return { ...acc, [curr[0]]: curr[1] };
            }, {});
          return { stats };
        }
      })
    );

    res.status(200).send({
      data: stockInfo.reduce((acc, curr) => {
        return { ...acc, [Object.keys(curr)[0]]: Object.values(curr)[0] };
      }, {})
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

app.listen(port, () => console.log(`Server is running on port: ${port}`));
