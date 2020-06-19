const path = require('path')
const express = require('express')
const xss = require('xss')
const folderServices = require('./folder-services')

const folderRouter = express.Router();
const jsonParser = express.json();

const serializedFolder = folder => ({
    id: folder.id,
    title: xss(folder.title),
    date_created: folder.date_created
})

folderRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        folderServices.getAllFolders(knexInstance)
            .then(folders => {
                res.json(folders.map(serializedFolder))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { title, date_created } = req.body;
        const newFolder = { title };

        for (const [key, value] of Object.entries(newFolder))
            if (value == null)
                return res.status(400).json({
                    error: {message: `Missing '${key}' in request body`}
                })

        newFolder.date_created = date_created

        folderServices.insertFolder(
            req.app.get('db'),
            newFolder
        )
            .then(folder => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${folder.id}`))
                    .json(serializedFolder(folder))
            })
            .catch(next)
    })

module.exports = folderRouter;