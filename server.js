const axios = require("axios");
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
    res.status(400).send({ messsage: "Please provide key and ticker" });
  }

  const url = `https://finance.yahoo.com/quote/${ticker}/history`;

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    res.send($.html());
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send({ message: "Error fetching data" });
  }
});

app.listen(port, () => console.log(`Server is running on port: ${port}`));
