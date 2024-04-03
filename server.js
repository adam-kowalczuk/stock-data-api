// Import required modules
const cheerio = require("cheerio");
const app = require("express")();
const port = process.env.PORT || 8008;
const secretKey = process.env.SECRET_PASS;

// Middleware to enable Cross-Origin Resource Sharing (CORS)
app.use(require("cors")());

// Route to handle requests to the root URL
app.get("/", (req, res) => {
  res.status(200).send("<h1>Stock Data API</h1>");
});

// Route to handle requests for specific stock tickers
app.get("/:ticker", async (req, res) => {
  // Extract ticker and key from request parameters and query
  const { ticker } = req.params;
  const { key } = req.query;

  // Check if ticker and key are provided
  if (!ticker || !key || key !== secretKey) {
    return res.status(400).send({ message: "Please provide key and ticker" });
  }

  try {
    // Fetch stock information asynchronously
    const stockInfo = await Promise.all(
      // Array of data types to fetch for each stock
      ["key-statistics", "history"].map(async (type) => {
        const url = `https://finance.yahoo.com/quote/${ticker}/${type}`;

        // Fetch HTML content from Yahoo Finance
        const response = await fetch(url);
        const data = await response.text();
        const $ = cheerio.load(data);

        // Process data based on type
        if (type === "history") {
          // Extract historical prices
          const prices = $("td:nth-child(6)")
            .get()
            .map((val) => $(val).text());
          return { prices };
        }

        if (type === "key-statistics") {
          // Extract key statistics
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
              // Reduce statistics to required metrics
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

    // Send stock information as response
    res.status(200).send({
      data: stockInfo.reduce((acc, curr) => {
        return { ...acc, [Object.keys(curr)[0]]: Object.values(curr)[0] };
      }, {})
    });
  } catch (error) {
    // Handle errors
    res.status(500).send({ message: error.message });
  }
});

// Start the server and listen on the specified port
app.listen(port, () => console.log(`Server is running on port: ${port}`));
