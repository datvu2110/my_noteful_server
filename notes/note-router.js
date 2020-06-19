const path = require('path')
const express = require('express')
const xss = require('xss')
const NoteService = require('./note-services')

const notesRouter = express.Router();
const jsonParser = express.json();

const serializeNote = note => ({
    id: note.id,
    title: xss(note.title),
    note_contents: xss(note.note_contents),
    date_created: note.date_created,
    folder_id: note.folder_id,
})

notesRouter
    .route('/')
    //  Grabs all of the values in the noteful_notes table
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        NoteService.getAllNotes(knexInstance)
            .then(notes => {
                res.json(notes.map(serializeNote))
            })
            .catch(next)
    })

    //  Adds a note to the noteful_notes table. Requires, title, note_contens
    //and folder_id. Then grabs the current time and adds the note to the table.
    //The folder_id connects it to a folder in the noteful_folders table.
    .post(jsonParser, (req, res, next) => {
        const { title, note_contents, folder_id, date_created } = req.body;
        const newNote = { title, note_contents, folder_id};

        for (const [key, value] of Object.entries(newNote))
            if (value == null)
                return res.status(400).json({
                    error: {message: `Missing '${key}' in request body`}
                })
        
        newNote.date_created = date_created;

        NoteService.insertNote(
            req.app.get('db'),
            newNote
        )
            .then(note => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${note.id}`))
                    .json(serializeNote(note))
            })
            .catch(next)
    })

notesRouter
    .route('/:note_id')
    //  First grabs all of the data that fits the note_id
    .all((req, res, next) => {
        NoteService.getById(
            req.app.get('db'),
            req.params.note_id
        )
            .then(note => {
                if(!note) {
                    return res.status(404).json({
                        error: {message: `Comment doesn't exist`}
                    })
                }
                res.note = note
                next()
            })
            .catch(next)
    })

    //  Returns the note table entery gathered earlier
    .get((req, res, next) => {
        res.json(serializeNote(res.note))
    })

    //  Finds if there is a note with the given id. If so, it then removes it from the table
    .delete((req, res, next) => {
        NoteService.deleteNote(
            req.app.get('db'),
            req.params.note_id
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

    //  Checks if there is a note with the given id, then replaces all of the
    //date in the note with the data that is provided. 
    .patch(jsonParser, (req, res, next) => {
        const { title, note_contents, date_created, folder_id } = req.body;
        const noteToUpdate = { title, note_contents, date_created, folder_id };

        const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length
        if (numberOfValues === 0)
            return res.status(400).json({
                error: { message: `Request body must contain either 'text, 
                'note_contents' or 'folder_id'`}
            })

        NoteService.updateNote(
            req.app.get('db'),
            req.params.note_id,
            noteToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

notesRouter
    .route('/folder_id/:folder_id')
    //  This searches through the noteful_notes table and finds all the notes 
    //with the correct folder_id. 
    .get((req, res, next) => {
        NoteService.getAllByFolderId(
            req.app.get('db'),
            req.params.folder_id
        )
            .then(notes => {
                res.json(notes.map(serializeNote))
            })
            .catch(next)
    })

module.exports = notesRouter;