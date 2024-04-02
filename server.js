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
        }
      })
    );
    res.send({ data: prices });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

app.listen(port, () => console.log(`Server is running on port: ${port}`));
