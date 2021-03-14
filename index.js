const express = require("express");
const cors   = require("cors");
const routes = require("./src/routes/routes");
const porta = process.env.PORT || 8080;
const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);

app.listen(porta, () => console.log(`Listening on port ${porta}`));