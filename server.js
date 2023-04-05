const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// API Routes
app.get('/api/notes', (req, res) => {
  const filePath = path.join(__dirname, 'db', 'db.json');
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile() || stats.size === 0) {
      console.error('Error reading notes file:', err);
      res.json([]);
    } else {
      fs.readFile(filePath, (err, data) => {
        if (err) {
          console.error('Error reading notes file:', err);
          res.json([]);
        } else {
          let notes;
          try {
            notes = JSON.parse(data);
          } catch (err) {
            console.error('Error parsing JSON:', err);
            notes = [];
          }
          res.json(notes);
        }
      });
    }
  });
});



app.post('/api/notes', (req, res) => {
  fs.readFile(path.join(__dirname, 'db', 'db.json'), (err, data) => {
    if (err) throw err;
    const notes = JSON.parse(data);
    const newNote = {
      id: uuidv4(),
      title: req.body.title,
      text: req.body.text,
    };
    notes.push(newNote);
    fs.writeFile(
      path.join(__dirname, 'db', 'db.json'),
      JSON.stringify(notes),
      (err) => {
        if (err) throw err;
        res.json(newNote);
      }
    );
  });
});

app.delete('/api/notes/:id', (req, res) => {
  fs.readFile(path.join(__dirname, 'db', 'db.json'), (err, data) => {
    if (err) throw err;
    const notes = JSON.parse(data);
    const filteredNotes = notes.filter((note) => note.id !== req.params.id);
    fs.writeFile(
      path.join(__dirname, 'db', 'db.json'),
      JSON.stringify(filteredNotes),
      (err) => {
        if (err) throw err;
        res.send('Note deleted successfully');
      }
    );
  });
});

// HTML Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});



// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on PORT ${PORT}`);
});
