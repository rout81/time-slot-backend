//init express server
const express = require("express");
const cors = require("cors");
const connection = require("./config/db");
const { connect } = require("./config/db");

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());

app.get("/api", (req, res) => res.send("Hello World!"));

app.post("/api/add", (req, res) => {
  const { firstName, lastName, phoneNumber, timeSlot } = req.body;
  getBookingByTime(timeSlot).then((data) => {
    if (data.length === 0) {
      connection.query(
        "INSERT INTO `bookings` (`first-name`, `last-name`, `phone-number`, `time-slot`) VALUES (?, ?, ?, ?)",
        [firstName, lastName, phoneNumber, timeSlot],
        (err, results) => {
          if (err) {
            res.status(500).json({ status: "error", message: err.message || "Failed to book time slot" });
          } else {
            res.status(200).json({ status: "success", message: "Booked Time Slot Successfully" });
          }
        }
      );
    } else {
      //where in update
      connection.query(
        "UPDATE `bookings` set `first-name` = ?, `last-name` = ?, `phone-number` = ? WHERE `time-slot` = ?",
        [firstName, lastName, phoneNumber, timeSlot],
        (err, results) => {
          if (err) {
            res.status(500).json({ status: "error", message: err.message || "Failed to book time slot" });
          } else {
            res.status(200).json({ status: "success", message: "Updated Time Slot Successfully", data: results });
          }
        }
      );
    }
  });
});

app.get("/api/getTimeSlots", (req, res) => {
  connection.query("SELECT * FROM `bookings`", (err, results) => {
    if (err) {
      res.status(500).json({ status: "error", message: err.message || "Failed to get time slot" });
    } else {
      res.status(200).json({ status: "success", message: "Time Slot Fetched Successfully", data: results });
    }
  });
});

app.get("/api/getTimeSlot", (req, res) => {
  const timeSlot = Number(req.query.timeSlot);
  getBookingByTime(timeSlot)
    .then((data) => res.status(200).json({ status: "success", message: "Time Slot Fetched Successfully", data: data }))
    .catch((err) => res.status(200).json({ status: "success", message: "Time Slot Fetched Successfully" }));
});

const getBookingByTime = (time) => {
  return new Promise(async (resolve, reject) => {
    try {
      connection.query("SELECT * FROM `bookings` WHERE `time-slot` = ?", [time], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

app.listen(port, () => console.log(`server start on port ${port}`));
