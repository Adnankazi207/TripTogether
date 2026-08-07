const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a destination title'],
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    country: {
      type: String,
      required: [true, 'Please add a country'],
    },
    costIndex: {
      type: String,
      required: true,
      enum: ['$', '$$', '$$$'],
      default: '$$',
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    category: {
      type: String,
      required: true,
      enum: ['Adventure', 'Beach', 'Cultural', 'Nature', 'Urban'],
    },
    image: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
      default: '5-7 Days',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Destination', destinationSchema);
