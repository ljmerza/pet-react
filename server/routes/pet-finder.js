var express = require('express');
var router = express.Router();

var { formatPets } = require('../models/pet-finder');

const fetch = require('node-fetch');
const queryString = require('query-string');

const PET_FINDER_API_KEY = process.env.PET_FINDER_API_KEY;
const PET_FINDER_API_SECRET = process.env.PET_FINDER_API_SECRET;
const PET_FINDER_URL = process.env.PET_FINDER_URL;

const parameters = {
  format: 'json',
  key: PET_FINDER_API_KEY,
  location: ''
};

router.get('/find/:zipcode', async (req, res, next) => {
  const stringified = queryString.stringify({...parameters, location: req.params.zipcode});
  const petsResults = await fetch(`${PET_FINDER_URL}/pet.find?${stringified}`).then(res => res.json());

  const pets = petsResults.petfinder && 
    petsResults.petfinder.pets &&
    petsResults.petfinder.pets.pet;

  res.json({
    original: pets,
    pets: formatPets(pets),
    t: PET_FINDER_API_KEY,
    zipcode: req.params.zipcode
  });
});

module.exports = router;