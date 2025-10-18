import express from "express";
// import bcrypt from "bcrypt";
import db from "../connect/db.js";

const routerRead = express.Router();

routerRead.get("/loggedin", async (req, res) => {
  let coll = await db.collection("playersPrimary");

  let playerData = await coll.findOne({email: req.query.email});

  // const hashedPassword = playerData.password;
  // const userInputPassword = req.query.password;

  // bcrypt.compare(userInputPassword, hashedPassword, (err, result) => {
  //   if (result) {
  res.json({status: 200, user: playerData});      
  //   } else {
  //     res.json({status: 400});
  //   };
  // });
});

// 'ownerID' comes from how I wrote the original query for the browser
routerRead.get("/existingplayers", async (req, res) => {
  let playerCollection = await db.collection("playersGroup");
  let players = await playerCollection.find({belongsTo: req.query.ownerID}).toArray();
  res.json(players);
});

routerRead.get("/existingcourses", async (req, res) => {
  let courseCollection = await db.collection("courses");
  let courses = await courseCollection.find({belongsTo:req.query.ownerID}).toArray();
  res.json(courses);
});

routerRead.get("/existingrounds", async (req, res) => {
  let roundsCollection = await db.collection("roundsPlayed");
  let rounds = await roundsCollection.find({belongsTo:req.query.ownerID}).toArray();
  res.json(rounds);
});

export default routerRead;