const app = require("./app");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT_SERVER || 3000;
const URL_DB = process.env.DB_URL;

mongoose
  .connect(URL_DB)
  .then(() => {
    console.log("Database connection successful");
    app.listen(PORT, () => {
      console.log(`Server is running. Use our API on port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(`Server is not running. Error:${err.message}`);
    process.exit(1);
  });
