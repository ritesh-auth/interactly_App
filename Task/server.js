require('dotenv').config({path: './config/.env'});

const express  = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');


const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));

const accountSSID = process.env.SSID ;
const authToken = process.env.AUTH_TOKEN ;
const client = twilio(accountSSID, authToken)

app.post('/makeCall', (req, res) => {

    const {mobileNumber} = req.body;

    if(!mobileNumber) {
      return res.status(400).json({
        error: 'Enter an Valid Phone !'
      })
    }

    client.calls.create({
      url: 'https://8035-152-58-223-96.ngrok-free.app/response',
      to: process.env.To_Mobile,
      from: process.env.Twilio_Number,
    })
    .then(call => res.json({
      message: "call initialized", callSid: call.sid
    }))
    .catch(err => res.status(500).json({
      error: err.message
    }));
});






const ivrResponse = async (req, res) => {

 const twiml  = new twilio.twiml.VoiceResponse();

 twiml .play('https://storage.googleapis.com/initaudio/Fara%20interview%20audio.mp3');

 twiml .gather({

    input: 'dtmf',
    numDigits: 1,
    action: '/processResponse',

  });
  
  res.type('text/xml');
  res.send(twiml .toString());

}

const processResponse = async (req, res) => {

  const digits = req.body.Digits;
  const candidateNumber = process.env.To_Mobile;

  const twiml  = new twilio.twiml.VoiceResponse();

  if(digits === '1') {

    twiml.say('Thank You for Your interest. An Text Message will be sent with an Interview link');

  try {
    const message = await client.messages.create({
        body: 'Thank you for your interest in the role of Backend Developer Intern. Please complete the interview using following link : https://v.personaliz.ai/?id=9b697c1a&uid=fe141702f66c760d85ab&mode=test ',
        from: process.env.Twilio_Number,
        to: candidateNumber
    });
    console.log('SMS Sent : ', message.sid);
  }catch (error) {
    console.log('Error Sending SMS', error);
  }
} else {

  twiml .say('Thank You for Your Response. Have a Great Day')
}
res.type('text/xml');
res.send(twiml .toString());
};

app.post('/response', ivrResponse);
app.post('/processResponse', processResponse);

const port = process.env.PORT;

app.listen(port , () => {
  console.log(`server started on port: ${port}`);
})