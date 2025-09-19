const http = require('http')
const express = require('express')
const { read } = require('fs')
const app = express()
const cors = require('cors')

app.use(cors())
// const app = http.createServer((request, response) => {
//     response.writeHead(200, { 'Content-Type': 'application/json' })
//     response.end(JSON.stringify(notes))
// })

app.use(express.json())

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}

app.use(requestLogger)

let notes = [
    {
        id: "1",
        content: "HTML is easy",
        important: true
    },
    {
        id: "2",
        content: "Browser can execute only JavaScript",
        important: false
    },
    {
        id: "3",
        content: "GET and POST are the most important methods of HTTP protocol",
        important: true
    }
]
app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/notes', (request, response) => {
    response.json(notes)
})

app.get('/api/notes/:id', (request, response) => {
    const id = request.params.id
    const note = notes.find(note => note.id === id)
    if (note) {
        response.json(note)
    } else {
        response.status(404).json({ error: 'note not found' })
    }
})

/*//////////////////////////////////////////////////////////////
                            HELPER FUNCTION
 //////////////////////////////////////////////////////////////*/

const generateId = () => {
    const maxId = notes.length > 0 ? Math.max(...notes.map(n => Number(n.id))) : 0
    return String(maxId + 1)
}
app.post('/api/notes', (req, res) => {
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
    const note = {
        // id: String(notes.length + 1), // simple id generator
        // id: id,
        id: generateId(),
        content: body.content,
        important: body.important || false, // default false if not sent
    }

    notes = notes.concat(note)
    res.status(201).json(note)
})

app.delete('/api/notes/:id', (request, response) => {
    const id = request.params.id
    notes = notes.filter(note => note.id !== id)

    response.status(204).end()
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.port || 3000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})