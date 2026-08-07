const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      required: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Please add a start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please add an end date'],
    },
    budget: {
      type: Number,
      required: [true, 'Please add a budget'],
      min: [0, 'Budget cannot be negative'],
    },
    notes: {
      type: String,
    },
    itinerary: {
      type: [
        {
          day: Number,
          activities: [
            {
              time: String,
              activity: {
                type: String,
                required: true,
              },
              desc: String,
            }
          ],
        }
      ],
      default: [],
    },
    packingList: {
      type: [
        {
          item: String,
          category: {
            type: String,
            default: 'Other',
          },
          packed: {
            type: Boolean,
            default: false,
          }
        }
      ],
      default: [],
    },
    inviteCode: {
      type: String,
      unique: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }
    ],
    photos: [
      {
        url: {
          type: String,
          required: true,
        },
        uploadedBy: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        }
      }
    ],
    locations: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        userName: {
          type: String,
          required: true,
        },
        latitude: {
          type: Number,
          required: true,
        },
        longitude: {
          type: Number,
          required: true,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        }
      }
    ]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Trip', tripSchema);
