const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../../middleware/auth');
const router = express.Router();
const path = require('path');
const fs = require('fs');


router.get('/maps/:id', (req, res) => {
  try {
    const { id } = req.params;
    const dataPath = path.join(__dirname, '..', '..', 'data', `${id}-data.js`);
    const data = readDataFile(dataPath);
    res.json(data);
  } catch (error) {
    console.error('Error reading data:', error);
    res.status(500).json({ error: 'Failed to read data file' });
  }
});

router.get('/maps/:mapId/hex/:id', (req, res) => {
  try {
    const { mapId, id } = req.params;
    
    const dataPath = path.join(__dirname, '..', '..', 'data', `${mapId}-data.js`);
    const data = readDataFile(dataPath);
    const mapIndex = data.findIndex(item => item.id === id);
    
    if (mapIndex !== -1) {
      res.json({ success: true, data: data[mapIndex] });
    } else {
      res.status(404).json({ error: 'Location not found' });
    }
  } catch (error) {
    console.error('Error updating data:', error);
    res.status(500).json({ error: 'Failed to update data' });
  }
});

router.put('/maps/:mapId/hex/:id', (req, res) => {
  try {
    const { mapId, id } = req.params;
    const updates = req.body;
    
    const dataPath = path.join(__dirname, '..', '..', 'data', `${mapId}-data.js`);
    const data = readDataFile(dataPath);

    const locationIndex = data.findIndex(item => item['id'] === id);

    if (locationIndex !== -1) {
      // Update the location
      data[locationIndex] = { ...data[locationIndex], ...updates };
      
      // Write back to main data file
      writeDataFile(dataPath, data);
      
      // Also update player data
      const playerDataPath = path.join(__dirname, 'player', 'data', `${mapId}-data.js`);
      if (fs.existsSync(path.dirname(playerDataPath))) {
        writeDataFile(playerDataPath, data);
      }
      
      res.json({ success: true, data: data[locationIndex] });
    } else {
      res.status(404).json({ error: 'Location not found' });
    }
  } catch (error) {
    console.error('Error updating data:', error);
    res.status(500).json({ error: 'Failed to update data' });
  }
});

function readDataFile(filePath) {
  try {
    const dataContent = fs.readFileSync(filePath, 'utf8');
    // Try to extract JSON from module.exports format
    const jsonMatch = dataContent.match(/module\.exports\s*=\s*(\[[\s\S]*\])/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    
    // If that fails, try to require it directly
    delete require.cache[require.resolve(filePath)];
    return require(filePath);
  } catch (error) {
    console.error('Error reading data file:', error);
    return [];
  }
}

function writeDataFile(filePath, data) {
  const content = `module.exports = ${JSON.stringify(data, null, 2)};`;
  fs.writeFileSync(filePath, content, 'utf8');
}

module.exports = router;