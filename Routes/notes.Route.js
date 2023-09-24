const { Router, application } = require("express");
const { NoteModel } = require("../Models/note.model");
const jwt = require("jsonwebtoken");
const { authentication } = require("../Middlewares/authentication");
const { authorization } = require("../Middlewares/authorization");

const notesController = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Note:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           description: The auto-generated id of the user
 *         heading:
 *           type: string
 *           description: The heading of the note
 *         description:
 *           type: string
 *           description: The description of the note
 *         tag:
 *           type: string
 *           description: The Tag of the notes created
 */

/**
 * @swagger
 * tags:
 *   name: Notes
 *   description: All the API routes related to Note
 */
/**
/**
 * @swagger
 * /notes:
 *   get:
 *     summary: Get all notes for a user
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notes fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: A success message
 *                 name:
 *                   type: string
 *                   description: The name of the user
 *                 notes:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Note"
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

notesController.get("/", authentication, async (req, res) => {
  const { userId, name } = req.body;
  const notes = await NoteModel.find({ userId: userId });
  if (!notes) {
    return res.status(500).json({ msg: "Something went wrong" });
  }
  return res
    .status(200)
    .json({ msg: "Data fetched", name: name, notes: notes });
});

/**
 * @swagger
 * /notes/{id}:
 *   get:
 *     summary: Get a single note by ID
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the note to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Note fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: A success message
 *                 note:
 *                   $ref: "#/components/schemas/Note"
 *       500:
 *         description: Something went wrong
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: An error message
 *     security:
 *       - bearerAuth: []
 */

notesController.get("/:id", authentication, authorization, async (req, res) => {
  const id = req.params.id;

  const singleNote = await NoteModel.findOne({ _id: id });

  if (!singleNote) {
    return res.status(500).json({ msg: "Something went wrong." });
  }

  return res.status(200).json({ msg: "Note fetched", note: singleNote });
});

/**
 * @swagger
 * /notes/create:
 *   post:
 *     summary: Create a new note
 *     tags: [Notes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user creating the note
 *               heading:
 *                 type: string
 *                 description: The heading of the note
 *               description:
 *                 type: string
 *                 description: The description of the note
 *               tag:
 *                 type: string
 *                 description: The tag of the note
 *     responses:
 *       201:
 *         description: Note Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: A success message
 *       400:
 *         description: Bad Request - Missing or invalid input fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: An error message indicating missing or invalid fields
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
 *     security:
 *       - bearerAuth: []
 */

notesController.post("/create", authentication, async (req, res) => {
  const { userId, heading, description, tag } = req.body;
  if (!userId || !heading || !description || !tag) {
    return res.status(400).json({ msg: "Please fill all the input fields" });
  }
  const payload = req.body;
  const newPayload = { ...payload, userId: userId };
  // console.log(newPayload)
  const notes = await new NoteModel(newPayload);
  try {
    notes.save();
    return res.status(201).json({ msg: "Note Created" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Something went wrong." });
  }
});

/**
 * @swagger
 * /notes/update/{id}:
 *   patch:
 *     summary: Update a note by ID
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the note to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               // Define your request body properties here
 *     responses:
 *       200:
 *         description: Note updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: A success message
 *       400:
 *         description: Bad Request - Invalid input or missing fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: An error message indicating invalid input or missing fields
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
 *     security:
 *       - bearerAuth: []
 */

notesController.patch(
  "/update/:id",
  authentication,
  authorization,
  async (req, res) => {
    const id = req.params.id;
    const payload = req.body;
    await NoteModel.findByIdAndUpdate({ _id: id }, payload);
    try {
      return res.status(200).json({ msg: "Note updated" });
    } catch (err) {
      console.log(err);
      return res.status(400).json({ msg: "Something went wrong" });
    }
  }
);

/**
 * @swagger
 * /notes/{id}:
 *   delete:
 *     summary: Delete a note by ID
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the note to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Note deleted successfully
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
 *     security:
 *       - bearerAuth: []
 */

notesController.delete(
  "/:id",
  authentication,
  authorization,
  async (req, res) => {
    const id = req.params.id;
    await NoteModel.findByIdAndDelete({ _id: id });
    try {
      return res.status(200).json({ msg: "Note deleted" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ msg: "Something went wrong" });
    }
  }
);

module.exports = {
  notesController,
};
