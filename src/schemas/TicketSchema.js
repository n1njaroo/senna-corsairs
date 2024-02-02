const { model, Schema } = require("mongoose");

// Define the TicketSchema
module.exports = model(
  "TicketSchema",
  new Schema({
    // User ID associated with the ticket
    userId: {
      type: String,
      required: true, // User ID is required
    },
    // Channel ID associated with the ticket
    channelId: {
      type: String,
      required: true, // Channel ID is required
    },
    // Array of messages in the ticket
    messages: {
      type: Array,
      required: true, // Messages array is required
    },
  })
);
