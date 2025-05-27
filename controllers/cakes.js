const cake = require('../models/cake');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../errors');

const getAllCakes = async (req, res) => {
   res.status(500).json({ message: 'Server error', error });

}

const getCake = async (req, res) => {
  res.status(200).json({ message: 'Get a single cake' });
}

const createCake = async (req, res) => {
  req.body.createdBy = req.user.userId;
  const cake = await cake.create(req.body);
  res.status(201).json({ message: 'User registered successfully' });
  
}

const updateCake = async (req, res) => {
  res.status(200).json({ message: 'User logged in successfully' });
 
}

const deleteCake = async (req, res) => {

  res.status(200).json({ message: 'User logged in successfully' });
  
}

module.exports = {
  getAllCakes,
  getCake,
  createCake,
    updateCake,
    deleteCake
}