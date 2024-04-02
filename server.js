const cheerio = require("cheerio");
const app = require("express")();
const port = process.env.PORT || 8080;

app.use(require("cors")());

app.get("/", (req, res) => {
  res.status(200).send("<h1>Stock Data API</h1>");
});

app.get("/:ticker", async (req, res) => {
  const { ticker } = req.params;
  const { key } = req.query;

  if (!ticker || !key) {
    res.status(400).send({ message: "Please provide key and ticker" });
  }

  const url = `https://finance.yahoo.com/quote/${ticker}/history`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.log("Don't worry, everything is fine");
      return;
    }
    const data = await response.text();
    const $ = cheerio.load(data);
    return res.send($.html());
  } catch (error) {
    console.error("Error fetching data:", error);
    return res.status(500).send({ message: "Error fetching data" });
  }
});

app.listen(port, () => console.log(`Server is running on port: ${port}`));
