const Cake = require("../models/cake");
const User = require("../models/User");
const faker = require("@faker-js/faker").fakerEN_US;
const FactoryGirl = require('factory-girl');
require("dotenv").config();

const testUserPassword = "StrongPassword123!";
const factory = FactoryGirl.factory;
const MongooseAdapter = new FactoryGirl.MongooseAdapter();
factory.setAdapter(MongooseAdapter);
factory.define("cake", Cake, {
  name: () => faker.commerce.productName(),
  description: () => faker.commerce.productDescription().slice(0, 100),
  image: () => faker.image.avatar(),
  price: () => faker.commerce.price(),
  isAvailable: () => faker.datatype.boolean(),
});

factory.define("user", User, {
  name: () => faker.person.fullName(),
  email: () => faker.internet.email(),
  password: () => faker.internet.password(),
});

const seed_db = async () => {
  let testUser = null;
  try {
    const mongoURL = process.env.MONGO_URI_TEST;
    await Cake.deleteMany({}); // deletes all job records
    await User.deleteMany({}); // and all the users
    testUser = await factory.create("user", { password: testUserPassword });
    await factory.createMany("cake", 20, { createdBy: testUser._id }); // put 30 job entries in the database.
  } catch (e) {
    console.log("database error");
    console.log(e.message);
    throw e;
  }
  return testUser;
};

module.exports = { testUserPassword, factory, seed_db };