const app = require("express")();
const port = process.env.PORT || 8008;

app.get("/", (req, res) => {
  res.status(200).send("<h1>Stock Data API</h1>");
});

app.get("/:ticker", (req, res) => {
  const { ticker } = req.params;
  const { key } = req.query;

  if (!ticker || !key) {
    res.status(400).send({ messsage: "Please provide key and ticker" });
  }
});

app.listen(port, () => console.log(`Server is running on port: ${port}`));
