const Cake = require('../models/cake');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../errors');

const getAllCakes = async (req, res) => {
  const { sort } = req.query;

  let result = Cake.find({ createdBy: req.user.userId });

  if (sort) {
    result = result.collation({ locale: 'en', strength: 2 }).sort(sort);
  } else {
    result = result.sort('createdAt'); 
  }

  const cakes = await result;
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
  const { price, isAvailable } = req.body;

  if (price !== undefined && price < 0) {
    throw new BadRequestError('Price must be a positive number');
  }

  if (isAvailable !== undefined && typeof isAvailable !== 'boolean') {
    throw new BadRequestError('isAvailable must be true or false');
  }

  req.body.createdBy = req.user.userId;
  const cake = await Cake.create(req.body);
  res.status(StatusCodes.CREATED).json({ cake });
};



const updateCake = async (req, res) => {
  const {
    body: { name, description, price, isAvailable },
    user: { userId },
    params: { id: cakeId },
  } = req;

  if (name === '' || description === '') {
    throw new BadRequestError('Name or Description cannot be empty');
  }

  if (price !== undefined && price < 0) {
    throw new BadRequestError('Price must be a positive number');
  }

  if (isAvailable !== undefined && typeof isAvailable !== 'boolean') {
    throw new BadRequestError('isAvailable must be true or false');
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
};


const deleteCake = async (req, res) => {
  const {user:{userId}, params:{id: cakeId}} = req;
  
  const cake = await Cake.findByIdAndRemove({
    _id:cakeId, createdBy:userId
  });

  if (!cake) {
    throw new NotFoundError(`No cake with id ${cakeId}`);
  }

   res.status(StatusCodes.OK).json({ msg: "The entry was deleted." });
}

module.exports = {
  getAllCakes,
  getCake,
  createCake,
    updateCake,
    deleteCake
}