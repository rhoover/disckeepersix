import express from "express";
import db from "../connect/db.js";
import { ObjectId } from "mongodb";

const routerDelete = express.Router();

routerDelete.get("/deleteplayer", async (req, res) => {
  let players = await db.collection("playersGroup");
  let player = await players.deleteOne({_id: new ObjectId(req.query.playerID)});
  res.json({status: 200, deleted: player});
});

routerDelete.get("/deletecourse", async (req, res) => {
  let courses = await db.collection("courses");
  let course = await courses.deleteOne({_id: new ObjectId(req.query.courseID)});
  res.json({status: 200, deleted: course});
});



export default routerDelete;