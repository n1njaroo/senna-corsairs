const { Schema, model } = require("mongoose");

let ticketSchema = new Schema({
  Guild: String,
  Category: String,
});

module.exports = model("ticketsys100110", ticketSchema);
