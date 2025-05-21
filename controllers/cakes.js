const Cake = require('../models/cake');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../errors');

const getAllCakes = async (req, res) => {
  const cakes = await Cake.find({ createdBy: req.user.userId }).sort('createdAt');
  res.status(StatusCodes.OK).json({ cakes, count: cakes.length });

}

const getCake = async (req, res) => {
  const {user:{userId}, params:{id: cakeId}} = req;

  const cake = await Cake.findOne({
    _id:cakeId, createdBy:userId
  });

  if (!cake) {
    throw new NotFoundError(`No cake with id ${cakeId}`);
  }
  res.status(StatusCodes.OK).json({ cake });
}

const createCake = async (req, res) => {
  req.body.createdBy = req.user.userId;
  const cake = await cake.create(req.body);
  res.status(201).json({ message: 'User registered successfully' });
  
}

const updateCake = async (req, res) => {
  const {body:{name, description}, user:{userId}, params:{id: cakeId}} = req;

  if (name=== '' || description === '') {
    throw new BadRequestError('Name or Description cannot be empty');
  }
  
  const cake = await Cake.findByIdAndUpdate(
    { _id: cakeId, createdBy: userId },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!cake) {
    throw new NotFoundError(`No cake with id ${cakeId}`);
  }
  res.status(StatusCodes.OK).json({ cake });
 
}

const deleteCake = async (req, res) => {
  const {user:{userId}, params:{id: cakeId}} = req;
  
  const cake = await Cake.findByIdAndRemove({
    _id:cakeId, createdBy:userId
  });

  if (!cake) {
    throw new NotFoundError(`No cake with id ${cakeId}`);
  }

   res.status(StatusCodes.OK).send();
}

module.exports = {
  getAllCakes,
  getCake,
  createCake,
    updateCake,
    deleteCake
}