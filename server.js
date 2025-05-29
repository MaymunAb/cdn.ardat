const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const BASE_DIR = path.join(__dirname, 'classes'); // Folder to serve

app.use(express.static('public'));

app.get('/list', (req, res) => {
  const relPath = req.query.path || '';
  const targetDir = path.join(BASE_DIR, relPath);

  fs.readdir(targetDir, { withFileTypes: true }, (err, items) => {
    if (err) return res.status(500).json({ error: err.message });

    const result = items.map(item => ({
      name: item.name,
      type: item.isDirectory() ? 'folder' : 'file'
    }));

    res.json({ path: relPath, items: result });
  });
});

app.get('/link', (req, res) => {
  const relPath = req.query.path || '';
  const fullPath = path.join(BASE_DIR, relPath);

  // Security check
  if (!fullPath.startsWith(BASE_DIR)) {
    return res.status(403).send('Access denied.');
  }

  fs.readFile(fullPath, 'utf-8', (err, data) => {
    if (err) return res.status(500).send('Could not read link.');
    res.send(data.trim()); // Return just the URL
  });
});


app.get('/file', (req, res) => {
  const filePath = path.join(BASE_DIR, req.query.path || '');
  res.sendFile(filePath);
});

app.get('/download', (req, res) => {
  const relPath = req.query.path || '';
  const fullPath = path.join(BASE_DIR, relPath);

  // Security check: ensure the path is inside BASE_DIR
  if (!fullPath.startsWith(BASE_DIR)) {
    return res.status(403).send('Access denied.');
  }

  res.download(fullPath, err => {
    if (err) {
      console.error('Download error:', err.message);
      res.status(404).send('File not found.');
    }
  });
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
