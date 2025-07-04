const mongoose = require("mongoose");
const { Schema } = mongoose;
const cakeSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    maxlength: 50,
  },
  description: {
    type: String,
    required: [true,'Please provide a description'],
    maxlength: 100,
  },
  image: {
    type: String,
    required: [true, 'Please provide an image URL or put N/A'],
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: 0,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  
}, {timestamps: true});

module.exports = mongoose.model("Cake", cakeSchema);