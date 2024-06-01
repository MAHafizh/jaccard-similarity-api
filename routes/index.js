const express = require('express');
const router = express.Router();
const {getDiagnosa, deleteDataKasusbyId} = require('../controller/index.js')

router.get('/', (req, res) => {
    res.send('API is running');
  });

router.post('/diagnosa', getDiagnosa)
router.delete('/delete-case/:caseId', deleteDataKasusbyId)

module.exports = router;