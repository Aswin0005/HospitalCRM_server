const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mongoose = require('mongoose');
const EmailLog = require('./models/Emaillogs');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI);


const patientEmails = {
  cancer: ['cancer_patient@gmail.com'],
  diabetes: ['diabetes_patient@gmail.com'],
  wellness: ['wellness_patient@gmail.com'],
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'aswinsundhar19@gmail.com',
    pass: process.env.PASS,
  },
});


app.post('/api/update-group', (req, res) => {
  const { groupId, email } = req.body;

  if (!patientEmails[groupId]) {
    return res.status(400).send('Invalid group ID');
  }

  patientEmails[groupId].push(email);
  res.status(200).send('Email added to group successfully');
});


app.post('/api/send-email', async (req, res) => {
  const { subject, message, patients, schedule } = req.body;
  const selectedPatients = patients.flatMap((group) => patientEmails[group]);

  const emailData = {
    from: 'aswinsundhar19@gmail.com',
    to: selectedPatients,
    subject,
    text: message,
  };

  try {
    if (schedule) {
      const delay = new Date(schedule) - new Date();
      setTimeout(async () => {
        await transporter.sendMail(emailData);
        await EmailLog.create({
          subject,
          message,
          patients: selectedPatients,
          status: 'Sent',
        });
      }, delay);
    } else {
      await transporter.sendMail(emailData);
      await EmailLog.create({
        subject,
        message,
        patients: selectedPatients,
        status: 'Sent',
      });
    }
    res.status(200).send('Email sent successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error sending email');
  }
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
