const express = require('express');
const router = express.Router();
const {getDiagnosa} = require('../controller/index.js')

router.get('/', (req, res) => {
    res.send('API is running');
  });

router.get('/diagnosa', getDiagnosa)

module.exports = router;