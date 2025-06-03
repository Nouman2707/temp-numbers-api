const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

const dataPath = path.join(__dirname, '..', 'database', 'numbers.json');

// Utility functions
function readNumbers() {
  try {
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error("readNumbers() error:", err.message);
    throw err;
  }
}



function writeNumbers(numbers) {
  fs.writeFileSync(dataPath, JSON.stringify(numbers, null, 2), 'utf8');
}

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to Phone Number Management API');
});

app.get('/api/numbers', (req, res) => {
  try {
    const numbers = readNumbers();
    res.json(numbers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read numbers.' });
  }
});

app.patch('/api/numbers/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;

  if (!status || !['active', 'inactive'].includes(status)) {
    return res.status(400).json({
      error: 'Invalid status. Status must be either "active" or "inactive"'
    });
  }

  try {
    const numbers = readNumbers();
    const index = numbers.findIndex(n => n.id === id);

    if (index === -1) {
      return res.status(404).json({ error: `Number with id ${id} not found` });
    }

    numbers[index].status = status;
    writeNumbers(numbers);

    res.json(numbers[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update number.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
