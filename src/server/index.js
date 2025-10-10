// node
import express from "express";
import cors from "cors";
import os from 'os';
import https from 'https';
import fs from 'fs';

//express app stuff
import routerCreate from "./api/create.js";
import routerRead from "./api/read.js";
import routerUpdate from "./api/update.js";
import routerDelete from "./api/delete.js";

// initialize
const app = express();
const port = 3000;
const hostname = os.hostname();

// middleware
app.use(express.json());
app.use(cors());

// API routes
app.use("/api", routerCreate); // C
app.use("/api", routerRead); // R
app.use("/api", routerUpdate); // U
app.use("/api", routerDelete); // D

switch (hostname) {
  case 'vivo':
    app.listen(port, () => {
      console.log(`Server listening at ${hostname} on port: ${port}`);
    });    
  break;
  case 'tripleDutyThree':
    console.log('it sees the server:', hostname);
    const keyCredentials = {
      privateKey: fs.readFileSync('/etc/letsencrypt/live/disckeeper.io/privkey.pem', 'utf8'),
      certKey: fs.readFileSync('/etc/letsencrypt/live/disckeeper.io/cert.pem', 'utf8'),
      fullChainKey: fs.readFileSync('/etc/letsencrypt/live/disckeeper.io/fullchain.pem', 'utf8')
    };
    const secureServer = https.createServer(keyCredentials, app);
    secureServer.listen(port, () => {
      console.log(`Secure Server listening at ${hostname} on port: ${port}`);
    });
  break;

  default:
    break;
};
