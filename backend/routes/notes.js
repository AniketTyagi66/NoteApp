const express = require('express');
const router = express.Router();
var fetchuser = require('../middleware/fetchuser');
var Note = require('../models/Note');
const { body, validationResult } = require('express-validator');

// Add CORS header
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  next();
});

//Route:1 Get all the notes using GET ,"api/notes/getuser"  login required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes)
    } catch (error) {
        res.status(500).send("Internal server error");
    }
})

//Route:2 add a new note using post ,"api/notes/addnote"  login required
router.post('/addnote', fetchuser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Description must be at least 5 characters').isLength({ min: 5 })], async (req, res) => {

        try {
            const { title, description, tag } = req.body;

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const note = new Note({
                title, description, tag, user: req.user.id
            })
            const saveNote = await note.save()
            res.json(saveNote)
        } catch (error) {
            res.status(500).send("Internal server error");
        }
    })

//Route:3 update a new note using put ,"api/notes/updatenote"  login required
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    const { title, description, tag } = req.body;

    try {
        //create a new note object
        const newNote = {};
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };

        //find the note to be updated and update it
        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(404).send("not found") }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("not allowed")
        }

        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json({ note });

    } catch (error) {
        res.status(500).send("Internal server error");
    }
})

//Route:4 Delete an existing note using delete ,"api/notes/deletenote"  login required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {
        //find the note to be deleted and delete it
        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(404).send("not found") }

        //allow deletion only if the user owns it
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("not allowed")
        }

        note = await Note.findByIdAndDelete(req.params.id)
        res.json({ "success": "Note has been deleted", note: note });
    } catch (error) {
        res.status(500).send("Internal server error");
    }
})

module.exports = router;
