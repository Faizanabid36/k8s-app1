const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
app.use(express.json());

function isValidCSV(content) {
  const lines = content.trim().split('\n');
  if (lines.length < 2) {
    return false;
  }
  const headers = lines[0].split(',');
  return (
    headers.length > 1 &&
    lines.every((line) => line.split(',').length === headers.length)
  );
}

app.post('/calculate', async (req, res) => {
  const { file, product } = req.body;

  if (!file) {
    return res.status(400).json({
      file: null,
      error: 'Invalid JSON input.',
    });
  }

  const filePath = path.join(__dirname + '/app/', file);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      file,
      error: 'File not found.',
    });
  }

  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    if (!isValidCSV(fileContent)) {
      return res.status(400).json({
        file,
        error: 'Input file not in CSV format.',
      });
    }

    const response = await axios.post(
      'http://container_two:8000/calculate-data',
      {
        file,
        product,
      }
    );
    return res.json(response.data);
  } catch (error) {
    return res.status(500).json({
      file,
      error: 'An error occurred while processing the file.',
      des: error.message,
      ddd: error.response,
    });
  }
});

app.post('/store-file', (req, res) => {
  const { file, data } = req.body;

  if (!file) {
    return res.status(400).json({
      file: null,
      error: "Invalid JSON input."
    });
  }

  const filePath = path.join(__dirname, file);
  fs.writeFile(filePath, data.replace(/\\n/g, '\n'), (err) => {
    if (err) {
      return res.status(500).json({
        file: file,
        error: "Error while storing the file to the storage."
      });
    }

    res.status(200).json({
      file: file,
      message: "Success."
    });
  });
});

const PORT = 6000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
