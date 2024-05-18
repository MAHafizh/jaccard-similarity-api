const express = require('express');
const bodyParser = require('body-parser');
const router = require('./routes/index.js')

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(express.json());
app.use(router);

app.listen(port, ()=>{
    console.log(`Server running on http://localhost:${port}`);
})