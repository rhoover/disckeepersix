import express from "express";
import db from "../connect/db.js";
import { ObjectId } from "mongodb";

const routerUpdate = express.Router();

routerUpdate.post("/updatecourse", async (req, res) => {

  let courseColl = await db.collection("courses");

  let course = req.body;
  let filter = {_id: new ObjectId(course._id)};
  let update = {
    $set: {
      roundsScored: course.roundsScored
    }
  };

  await courseColl.updateOne(filter, update  );
});

routerUpdate.post("/updateprimary", async (req, res) => {
  let primaries = await db.collection("playersPrimary");

  let primary = req.body;
  let filter = {_id: new ObjectId(primary._id)};

  // in case the course played already existed in the primary's array of courses played
  // it's not passed here
  // which is tested in the browser
  if (primary.coursePlayed) {
    let update = {
      $push: {
        coursesPlayed: primary.coursePlayed
      }
    };
      await primaries.updateOne(filter, update);
  };
});


export default routerUpdate;