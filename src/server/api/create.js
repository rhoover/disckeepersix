import express from "express";
// import bcrypt from "bcrypt";
import db from "../connect/db.js";

const routerCreate = express.Router();

// courtesy: https://medium.com/@amirhosseineidy/create-a-post-javascript-rest-api-with-mongodb-step-by-step-61ed86187b90
routerCreate.post("/signup", async (req, res) => {
  try {
    // initialize appropriate collection in db
    let coll = await db.collection("playersPrimary");
    // assign new data from browser to request body
    let newPrimary = req.body;

    // check if primary player already exists
    let existingPrimary = await coll.findOne({
      $and:[
        {nameFirst: newPrimary.nameFirst},
        {nameLast: newPrimary.nameLast}
      ]
    });
    // and if they do
    if (existingPrimary) {
      return res.status(400).json({error: "Player Already Exists"});
    };

    // hash the password
    // try {
    //   const saltRounds = 10;
    //   const hashedPassword = await bcrypt.hash(newPrimary.password, saltRounds);
    //   newPrimary.password = hashedPassword;
    // } catch (error) {
    //   console.error(error);
    // };

    // if truly new, add 'document' to collection
    await coll.insertOne(newPrimary);
    res.json({status: 201, owner: newPrimary});
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({error: 'Internal Server Error'});
  };
});

routerCreate.post("/createplayer", async (req, res) => {
  let playerColl = await db.collection("playersGroup");

  await playerColl.insertOne(req.body);
});

routerCreate.post("/createcourse", async (req, res) => {
  let courseColl = await db.collection("courses");

  await courseColl.insertOne(req.body);

  return res.json({status: 200});
});

routerCreate.post('/createround', async (req, res) => {
  let roundsColl = await db.collection("roundsPlayed");
  await roundsColl.insertOne(req.body);
});

export default routerCreate;