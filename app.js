const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const gameRoute = require('./routes/game.js');
const playerRoute = require('./routes/player.js')


const bodyParser = require('body-parser');

// Create Express app
const app = express();

// Middleware
app.use(express.json());
// app.use(cors()); 

const corsOpts = {
  origin: '*',

  methods: [
    'GET',
    'POST',
  ],

  allowedHeaders: [
    'Content-Type',
  ],
};

app.use(cors(corsOpts));



mongoose.connect('mongodb://192.168.1.9:27017/SLOT', {
  useNewUrlParser: true,
  useUnifiedTopology: true

})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });
app.get('/', (req, res) => {
  res.send('hello')
})

app.use('/game', gameRoute);
app.use('/player',playerRoute)

// Start the server
const port = process.env.PORT || 3002;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});