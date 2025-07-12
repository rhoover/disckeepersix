import express from "express";
import cors from "cors";
import routerCreate from "./api/create.js";
import routerRead from "./api/read.js";
import routerUpdate from "./api/update.js";
import routerDelete from "./api/delete.js";

// initialize
const app = express();
const port = 3000;

// middleware
app.use(express.json());
app.use(cors());

// API routes
app.use("/api", routerCreate); // C
app.use("/api", routerRead); // R
app.use("/api", routerUpdate); // U
app.use("/api", routerDelete); // D

app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening at http://localhost:${port}`);
});