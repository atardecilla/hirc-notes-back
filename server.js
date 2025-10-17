const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

//Using CORS
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Health Risk API is running. Use /calculate with query parameters.');
});

app.get('/ping', (req, res) => {
    console.log('Wake-up call received. Good morning server! :)');
    res.json({ message: 'Pong', status: 'Server is awake' });
});

app.get('/calculate', (req, res) => {
    const { age, feet, inches, weight, systolic, diastolic, familyHistory } = req.query;

    //Initialize variables
    let agePoints = 0, bmiPoints = 0, bpPoints = 0, familyHistoryPoints = 0;
    //Collect all input values
    const ageInt = parseInt(age);
    const feetInt = parseInt(feet);
    const inchesInt = parseInt(inches);
    const weightLbs = parseFloat(weight);
    const systolicInt = parseInt(systolic);
    const diastolicInt = parseInt(diastolic);

    //Server-side validation
    if (!age || age <= 0) return res.status(400).json({ error: 'Invalid age' });
    if (!feet || feet < 2) return res.status(400).json({ error: 'Height must be at least 2 feet' });
    if (!weight || weight < 50) return res.status(400).json({ error: 'Weight must be at least 50 lbs' });
    if (!systolic || !diastolic || systolic <= 0 || diastolic <= 0) 
        return res.status(400).json({ error: 'Invalid blood pressure' });

    //calculate BMI & determine category
    const totalInches = (feetInt * 12) + inchesInt; //convert height to total inches
    const bmi = (weightLbs / (totalInches * totalInches)) * 703;
    let bmiCategory;
    if (bmi < 25) {
        bmiCategory = "normal";
        bmiPoints = 0;
    } else if (bmi < 30) {
        bmiCategory = "overweight";
        bmiPoints = 30;
    } else {
        bmiCategory = "obese";
        bmiPoints = 75;
    }
    
    //calculate age points
    if (ageInt < 30) agePoints = 0;
    else if (ageInt < 45) agePoints = 10;
    else if (ageInt < 60) agePoints = 20;
    else agePoints = 30;
    //Blood pressure points
    let bpCategory;
    if (systolicInt < 120 && diastolicInt < 80) {
        bpCategory = "normal"; 
        bpPoints = 0;
    } else if (systolicInt< 130 && diastolic < 80) {
        bpCategory = "elevated"; 
        bpPoints = 15;
    } else if ((systolicInt < 140) || (diastolicInt < 90)) {
        bpCategory = "stage 1"; 
        bpPoints = 30;
    } else if ((systolicInt <= 180) || (diastolicInt <= 120)) {
        bpCategory = "stage 2"; 
        bpPoints = 75;
    } else {
        bpCategory = "crisis"; 
        bpPoints = 100;
    }
    
    //Family history points
    const familyHistoryArray = familyHistory ? familyHistory.split(',') : [];
    familyHistoryPoints = familyHistoryArray.length * 10; // 10 points per family history condition

//Calculate Risk
const riskScore = agePoints + bmiPoints + bpPoints + familyHistoryPoints;

//Calculate Category
let riskCategory = '';
if (riskScore < 20) riskCategory = "low";
else if (riskScore < 50) riskCategory = "moderate";
else if (riskScore < 75) riskCategory = "high";
else riskCategory = "uninsurable";

res.json({
        agePoints,
        bmi: bmi.toFixed(1),
        bmiCategory,
        bmiPoints,
        bpCategory,
        bpPoints,
        familyHistory,
        familyHistoryPoints,
        riskScore,
        riskCategory
    });

});

//Start Server
    app.listen(PORT, () => {
    console.log(`Health Risk API server running on port ${PORT}`);
    });