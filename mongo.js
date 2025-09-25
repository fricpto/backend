const mongoose = require('mongoose')
require('dotenv').config();
// const notes = require('./index.js')
if (process.argv.length < 3) {
    console.log('Please provide the password as an argument: node mongo.js <password>')
    process.exit(1)
}

const password = process.argv[2] || process.env.MONGO_PASSWORD

const url = `mongodb+srv://bee:${password}@cluster0.w6j9idt.mongodb.net/noteApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)

mongoose.connect(url)

const noteSchema = new mongoose.Schema({
    content: String,
    important: Boolean
})

const Note = mongoose.model('Note', noteSchema)

// const note = new Note({
//     content: 'HTML is easy',
//     important: true,
// })
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
// note.save().then(result => {
//     console.log('note saved!')
//     mongoose.connection.close()
// })

Note.find({})
    .then(existingNotes => {
        if (existingNotes.length === 0) {
            console.log('No notes found. Inserting...');
            return Note.insertMany(notes);
        } else {
            console.log('Notes already exist. Skipping insert.');
            return Promise.resolve(); // Skip insert
        }
    })
    .then(() => {
        // Fetch all notes to display
        return Note.find({});
    })
    .then(allNotes => {
        console.log('All notes in the database:\n');
        allNotes.forEach(note => {
            console.log(note);
        });
        mongoose.connection.close();
    })
    .catch(err => {
        console.error('Error:', err);
        mongoose.connection.close();
    });
