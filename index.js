const express = require("express");
const connection = require("./Config/db");
const { authController } = require("./Routes/auth.Route");
const { notesController } = require("./Routes/notes.Route");
const swaggerJsdocs = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

require("dotenv").config();
const cors = require("cors");

const app = express();

const PORT = process.env.PORT;

app.use(express.json());
app.use(cors());
app.use("/auth", authController);
app.use("/notes", notesController);

app.get("/", (req, res) => {
  res.json({ msg: "Welcome to homePage" });
});

//swagger
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Swagger for Note App",
      version: "1.0.0",
    },
    server: [
      {
        url: `https://localhost:${PORT}`,
      },
    ],
  },
  apis: ["./Routes/*.js"],
};
const swaggerSpec = swaggerJsdocs(options);

app.use("/apidocs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(PORT, async () => {
  try {
    await connection;
    console.log(`Listening on port ${PORT}`);
  } catch (err) {
    console.log("connection Failed");
    console.log(err);
  }
});
