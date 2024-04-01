const app = require("express")();
const port = process.env.PORT || 8008;

app.get("/", (req, res) => {
  res.status(200).send("<h1>Stock Data API</h1>");
});

app.listen(port, () => console.log(`Server is running on port: ${port}`));
