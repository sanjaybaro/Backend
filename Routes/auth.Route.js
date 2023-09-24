const { Router } = require("express");
const { UserModel } = require("../Models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
const { authentication } = require("../Middlewares/authentication");
const { authorization } = require("../Middlewares/authorization");

const authController = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the user
 *         email:
 *           type: string
 *           description: The email of the user
 *         password:
 *           type: string
 *           description: The password of the user
 */

/**
 * @swagger
 * tags:
 *   name: User
 *   description: API routes related to Users
 */

/**
 * @swagger
 * /auth:
 *   get:
 *     summary: Continue towards authentication
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Authentication route accessed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: A message indicating successful access to the authentication route
 */

authController.get("/", (req, res) => {
  res.json({ msg: "Continue towards authentication" });
});

/**
 * @swagger
 * /auth/user/{Id}:
 *   get:
 *     summary: Get a user's profile by ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: Id
 *         required: true
 *         description: The ID of the user to retrieve
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: A success message
 *                 user:
 *                   $ref: "#/components/schemas/User"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: An error message indicating that something went wrong
 */

authController.get("/user/:Id", authentication, async (req, res) => {
  const id = req.params.Id;
  const user = await UserModel.findOne({ _id: id });

  if (!user) {
    return res.status(500).json({
      msg: "Something went wrong,user not found. Please try again later.",
    });
  }
  return res
    .status(200)
    .json({ msg: "Profile fetched Succecsfully", user: user });
});
/**
 * @swagger
 * /auth/update/{id}:
 *   patch:
 *     summary: Update a user's profile by ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/User"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: A success message
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: An error message indicating that something went wrong
 */

authController.patch("/update/:id", authentication, async (req, res) => {
  const id = req.params.id;
  const payload = req.body;

  await UserModel.findByIdAndUpdate({ _id: id }, payload);

  try {
    res.status(200).json({ msg: "Profile updated successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Something went wrong", err: err });
  }
});
/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Sign up a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the user
 *               email:
 *                 type: string
 *                 description: The email of the user
 *               password:
 *                 type: string
 *                 description: The password of the user
 *     responses:
 *       201:
 *         description: Signup successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: A success message indicating successful signup
 *       400:
 *         description: Bad Request - Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: An error message indicating that the email is already in use
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: An error message indicating that something went wrong
 */

authController.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  const checkEmail = await UserModel.findOne({ email: email });
  if (!checkEmail) {
    let hashedPassword = bcrypt.hashSync(password, 6);
    if (!hashedPassword) {
      return res
        .status(500)
        .json({ msg: "Something went wrong. Please try again later." });
    } else {
      const user = new UserModel({
        name,
        email,
        password: hashedPassword,
      });
      try {
        await user.save();
        return res.status(201).json({ msg: "Signup Successful" });
      } catch (err) {
        console.log(err);
        res
          .status(500)
          .json({ msg: "Something went wrong. Please try again later" });
      }
    }
  } else {
    return res.status(400).json({ msg: "Please choose another email" });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email of the user
 *               password:
 *                 type: string
 *                 description: The password of the user
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A success message indicating successful login
 *                 token:
 *                   type: string
 *                   description: A JSON Web Token (JWT) for user authentication
 *       400:
 *         description: Bad Request - Invalid credentials or user not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: An error message indicating invalid credentials or user not found
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: An error message indicating that something went wrong
 */

authController.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) {
    return res.status(400).json({
      msg: "Something went wrong. Please give correct credentials and try again later.",
    });
  }
  const hashedPassword = user.password;
  bcrypt.compare(password, hashedPassword, (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ msg: "Something went wrong. Please try again later." });
    }
    if (result) {
      const token = jwt.sign(
        { userId: user._id, name: user.name },
        process.env.SECRET_KEY
      );
      return res.status(200).json({ message: "login succesful", token: token });
    } else {
      return res.status(400).json({
        msg: "Login failed. Invalid credentials, please signup if you haven't.",
      });
    }
  });
});

module.exports = {
  authController,
};
