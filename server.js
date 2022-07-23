const express = require('express');
const path = require('path');
const fs = require('fs');
const util = require('util');
const {
  readFromFile,
  readAndAppend,
  writeToFile,
} = require('./helpers/fsUtils');
let notes = require('./db/db.json');

// Helper method for generating unique ids
const uuid = require('./helpers/uuid');

const PORT = 3001;

const app = express();
// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);


app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/notes.html'))
);

app.get('/api/notes', (req, res) => {
  return  res.json(notes);
});

// POST request to add a note
app.post('/api/notes', (req, res) => {
  // Log that a Note request that was received
  console.info(`${req.method} request received to add a review`);

  // Destructuring assignment for the items in req.body
  const { title,text } = req.body;

  // If all the required properties are present
  if (title && text) {
    // Variable for the object we will save
    const newNotes = {
      title,
      text,
      id: uuid(),
    };
   fs.readFile('./db/db.json', 'utf8', (err, data) => {
      if (err) {
        console.error(err);
      } else {
        // Convert string into JSON object
        notes = JSON.parse(data);
        notes.push(newNotes);
    // Write the string to a file
    fs.writeFile(`./db/db.json`, JSON.stringify(notes,null, 4),(err) =>
      err
        ? console.error(err)
        : console.log(
            `Notes has been written to JSON file`
          )
    );
        }
      });

    const response = {
    body:notes
    };
    console.log(response);
    res.status(201).json(response);
  } else {
    res.status(500).json('Error in posting review');
  }
});

///To delete note
app.delete('/api/notes/:id', (req, res) => {
  
  const requestedId = req.params.id;
readFromFile('./db/db.json')
    .then((data) => JSON.parse(data))
    .then((json) => {
     notes = json.filter((id) => id.id !== requestedId);
      // Save that array to the filesystem
      fs.writeFileSync("./db/db.json", JSON.stringify(notes));
      });
    return  res.json(notes);
});
 
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);


app.listen(PORT, () =>
  console.info(`Example app listening at http://localhost:${PORT} 🚀`)
);
