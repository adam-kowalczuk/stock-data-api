const app = require("express")();
const port = process.env.PORT || 8008;

app.listen(port, () => console.log(`Server is running on port: ${port}`));
