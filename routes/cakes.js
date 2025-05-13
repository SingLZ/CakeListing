const express = require('express');
const router = express.Router();

const { getAllCakes, getCake, createCake, updateCake, deleteCake } = require('../controllers/cakes');

router.route('/').post(createCake).get(getAllCakes);
router.route('/:id').get(getCake).patch(updateCake).delete(deleteCake);

module.exports = router;