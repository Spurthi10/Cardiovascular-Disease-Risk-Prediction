const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  inputData: {
    age: Number,
    gender: String,
    systolic: Number,
    diastolic: Number,
    bmi: Number,
    cholesterol: Number,
    glucose: Number,
    hdl: Number,
    triglycerides: Number,
    hemoglobin: Number,
    smoking: Boolean,
    diabetes: Boolean,
    bloodRelDiabetes: Boolean,
    bloodRelStroke: Boolean,
    moderateWork: Boolean
  },
  riskScore: { type: Number, required: true },
  riskLevel: { type: String, enum: ['Low', 'Moderate', 'High'], required: true },
  probability: { type: Number, required: true },
  recommendations: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Prediction', predictionSchema);
