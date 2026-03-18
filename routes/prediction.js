const express = require('express');
const router = express.Router();
const Prediction = require('../models/Prediction');

function requireAuth(req, res, next) {
  if (req.session && req.session.userId) return next();
  res.status(401).json({ success: false, message: 'Not authenticated' });
}

// CVD Risk Calculation Algorithm (based on Framingham-inspired scoring)
function calculateCVDRisk(data) {
  let score = 0;

  // Age scoring
  if (data.age >= 65) score += 25;
  else if (data.age >= 55) score += 18;
  else if (data.age >= 45) score += 12;
  else if (data.age >= 35) score += 6;
  else score += 2;

  // Gender (male has higher baseline risk)
  if (data.gender === 'male') score += 5;

  // Systolic blood pressure
  if (data.systolic >= 180) score += 20;
  else if (data.systolic >= 160) score += 15;
  else if (data.systolic >= 140) score += 10;
  else if (data.systolic >= 120) score += 5;

  // Diastolic
  if (data.diastolic >= 100) score += 10;
  else if (data.diastolic >= 90) score += 6;
  else if (data.diastolic >= 80) score += 2;

  // BMI
  if (data.bmi >= 35) score += 12;
  else if (data.bmi >= 30) score += 8;
  else if (data.bmi >= 25) score += 4;

  // Cholesterol
  if (data.cholesterol >= 280) score += 15;
  else if (data.cholesterol >= 240) score += 10;
  else if (data.cholesterol >= 200) score += 5;

  // HDL (protective - subtract)
  if (data.hdl >= 60) score -= 5;
  else if (data.hdl < 40) score += 8;

  // Glucose
  if (data.glucose >= 200) score += 12;
  else if (data.glucose >= 126) score += 7;
  else if (data.glucose >= 100) score += 3;

  // Triglycerides
  if (data.triglycerides >= 500) score += 12;
  else if (data.triglycerides >= 200) score += 7;
  else if (data.triglycerides >= 150) score += 3;

  // Hemoglobin (low = higher risk)
  if (data.hemoglobin < 10) score += 8;
  else if (data.hemoglobin < 12) score += 4;

  // Binary risk factors
  if (data.smoking) score += 10;
  if (data.diabetes) score += 12;
  if (data.bloodRelDiabetes) score += 5;
  if (data.bloodRelStroke) score += 8;
  if (!data.moderateWork) score += 4;

  // Normalize to 0-100
  const maxScore = 160;
  const probability = Math.min((score / maxScore) * 100, 98);

  let riskLevel;
  if (probability < 30) riskLevel = 'Low';
  else if (probability < 60) riskLevel = 'Moderate';
  else riskLevel = 'High';

  // Generate recommendations
  const recommendations = [];
  if (data.systolic >= 140 || data.diastolic >= 90)
    recommendations.push('Monitor and manage blood pressure — consider consulting a cardiologist.');
  if (data.bmi >= 30)
    recommendations.push('Work toward a healthy BMI through balanced diet and regular exercise.');
  if (data.cholesterol >= 240)
    recommendations.push('Reduce saturated fats and consider cholesterol-lowering interventions.');
  if (data.hdl < 40)
    recommendations.push('Increase HDL levels through aerobic exercise and healthy fats (omega-3).');
  if (data.glucose >= 100)
    recommendations.push('Monitor blood glucose levels regularly and reduce refined sugar intake.');
  if (data.smoking)
    recommendations.push('Quit smoking — it significantly increases cardiovascular disease risk.');
  if (data.diabetes)
    recommendations.push('Tightly control blood sugar levels with medication and lifestyle changes.');
  if (!data.moderateWork)
    recommendations.push('Incorporate at least 150 minutes of moderate physical activity per week.');
  if (data.triglycerides >= 150)
    recommendations.push('Lower triglycerides through reduced alcohol, sugars, and refined carbs.');
  if (recommendations.length === 0)
    recommendations.push('Maintain your healthy lifestyle. Regular checkups are still recommended.');

  return { riskScore: Math.round(score), riskLevel, probability: Math.round(probability * 10) / 10, recommendations };
}

// Submit prediction
router.post('/predict', requireAuth, async (req, res) => {
  try {
    const data = req.body;
    const result = calculateCVDRisk(data);

    const prediction = new Prediction({
      userId: req.session.userId,
      inputData: data,
      ...result
    });
    await prediction.save();

    res.json({ success: true, result, id: prediction._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Prediction failed.' });
  }
});

// Get prediction history
router.get('/history', requireAuth, async (req, res) => {
  try {
    const predictions = await Prediction.find({ userId: req.session.userId })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, predictions });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch history.' });
  }
});

// Get stats for dashboard
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const total = await Prediction.countDocuments({ userId: req.session.userId });
    const low = await Prediction.countDocuments({ userId: req.session.userId, riskLevel: 'Low' });
    const moderate = await Prediction.countDocuments({ userId: req.session.userId, riskLevel: 'Moderate' });
    const high = await Prediction.countDocuments({ userId: req.session.userId, riskLevel: 'High' });
    const latest = await Prediction.findOne({ userId: req.session.userId }).sort({ createdAt: -1 });
    res.json({ success: true, total, low, moderate, high, latest });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats.' });
  }
});

module.exports = router;
