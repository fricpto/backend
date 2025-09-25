// const http = require('http')
require('dotenv').config();
const express = require('express')
// const { read } = require('fs')
const app = express()
// const cors = require('cors')
app.use(express.static('dist'))
// app.use(cors())
// const app = http.createServer((request, response) => {
//     response.writeHead(200, { 'Content-Type': 'application/json' })
//     response.end(JSON.stringify(notes))
// })
const Note = require('./models/note')
app.use(express.json())

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}

app.use(requestLogger)

// let notes = [
//     {
//         id: "1",
//         content: "HTML is easy",
//         important: true
//     },
//     {
//         id: "2",
//         content: "Browser can execute only JavaScript",
//         important: false
//     },
//     {
//         id: "3",
//         content: "GET and POST are the most important methods of HTTP protocol",
//         important: true
//     }
// ]
app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/notes', (request, response) => {
    Note.find({}).then(notes => {
        response.json(notes)
    })
})

app.get('/api/notes/:id', (request, response, next) => {
    // const id = request.params.id
    // const note = notes.find(note => note.id === id)
    // if (note) {
    //     response.json(note)
    // } else {
    //     response.status(404).json({ error: 'note not found' })
    // }
    Note.findById(request.params.id).then(note => {
        if (note) {
            response.json(note)
        } else {
            response.status(404).json({ error: 'note not found' })
        }
    }).catch(error => next(error))
    //.catch(error => {
    //     console.log(error)
    //     response.status(500).send({ error: 'malformatted id' })
    //})  
})

/*//////////////////////////////////////////////////////////////
                            HELPER FUNCTION
 //////////////////////////////////////////////////////////////*/

const generateId = () => {
    const maxId = notes.length > 0 ? Math.max(...notes.map(n => Number(n.id))) : 0
    return String(maxId + 1)
}
app.post('/api/notes', (req, res, next) => {
    const body = req.body

    if (!body.content) {
        return res.status(400).json({
            error: 'content missing'
        })
    }
    // check if ID already exists
    const id = body.id || req.params.id
    const existing = notes.find(note => note.id === id)
    if (existing) {
        return res.status(409).json({ error: 'id already exists' }) // 409 Conflict
    }
    // const note = {
    //     // id: String(notes.length + 1), // simple id generator
    //     // id: id,
    //     id: generateId(),
    //     content: body.content,
    //     important: body.important || false, // default false if not sent
    // }
    const note = new Note({
        content: body.content,
        important: body.important || false,
    })
    // notes = notes.concat(note)
    // res.status(201).json(note)
    note.save()
        .then(savedNote => {
            res.status(201).json(savedNote)
        })
        .catch(error => next(error))
})

app.put('/api/notes/:id', (request, response, next) => {
    const { content, important } = request.body

    Note.findById(request.params.id)
        .then(note => {
            if (!note) {
                return response.status(404).end()
            }

            note.content = content
            note.important = important

            return note.save().then((updatedNote) => {
                response.json(updatedNote)
            })
        })
        .catch(error => next(error))
})

app.delete('/api/notes/:id', async (req, res, next) => {
    try {
        const deletedNote = await Note.findByIdAndDelete(req.params.id)

        if (!deletedNote) {
            return res.status(404).json({ error: 'note not found' })
        }

        res.status(204).end() // success: no content
    } catch (error) {
        next(error) // pass errors to error handler
    }
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })

    }
    next(error)
}

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

// module.exports = notes