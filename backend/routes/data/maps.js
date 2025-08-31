const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken, optionalAuth } = require('../../middleware/auth');
const router = express.Router();
const path = require('path');
const fs = require('fs');

function getMapsFromFile() {
    const dataPath = path.join(__dirname, '..', '..', 'data', `map-data.js`);
    const maps = readDataFile(dataPath);
    maps.forEach(map => {
      const mapDataPath = path.join(__dirname, '..', '..', 'data', `${map.id}-data.js`);
      const mapData = readDataFile(mapDataPath);
      map['hexCount'] = mapData.length;
      map['thumbnail'] = `${map.id}-map.jpg`;
    });
    return maps
}

router.get('/maps', optionalAuth, (req, res) => {
  try {
    const isAuthenticated = !!req.user; 
    const maps = getMapsFromFile()
    res.json(maps);
  } catch (error) {
    console.error('Error reading data:', error);
    res.status(500).json({ error: 'Failed to read data file' });
  }
});

router.get('/maps/:id', optionalAuth, (req, res) => {
  try {
    const { id } = req.params;
    const isAuthenticated = !!req.user; 

    const maps = getMapsFromFile()
    const map = maps.find(x => x.id == id);

    if (!map) return res.status(404).json({ error: 'Map not found' });

    res.json(map);
  } catch (error) {
    console.error('Error reading data:', error);
    res.status(500).json({ error: 'Failed to read data file' });
  }
});

function getLocationsFromFile(mapId) {
    const dataPath = path.join(__dirname, '..', '..', 'data', `${mapId}-data.js`);
    const locations = readDataFile(dataPath);
    return locations
}

router.get('/maps/:id/locations', optionalAuth, (req, res) => {
  try {
    const { id } = req.params;
    const isAuthenticated = !!req.user; 
    const locations = getLocationsFromFile(id)
    res.json(locations.map(hex => obfuscateHex(hex, isAuthenticated)));
  } catch (error) {
    console.error('Error reading data:', error);
    res.status(500).json({ error: 'Failed to read data file' });
  }
});

router.get('/maps/:mapId/locations/:id', optionalAuth, (req, res) => {
  try {
    const { mapId, id } = req.params;
    const isAuthenticated = !!req.user; 

    const locations = getLocationsFromFile(mapId)
    const location = locations.find(item => item.id === id);

    if (!location) return res.status(404).json({ error: 'Location not found' });

    res.json({ success: true, data: obfuscateHex(location, isAuthenticated) });
  } catch (error) {
    console.error('Error reading data:', error);
    res.status(500).json({ error: 'Failed to read data' });
  }
});

// Protected route - only authenticated users can update hex data
router.put('/maps/:mapId/locations/:id', authenticateToken, (req, res) => {
  try {
    const { mapId, id } = req.params;
    const updates = req.body;
    
    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No update data provided' });
    }
    
    const allowedFields = ['id', 'x', 'y', 'name', 'text', 'status', 'nodeLabel', 'item', 'terrain', 'connectedTo'];
    const updateKeys = Object.keys(updates);
    const invalidFields = updateKeys.filter(key => !allowedFields.includes(key));
    
    if (invalidFields.length > 0) {
      return res.status(400).json({ 
        error: `Invalid fields: ${invalidFields.join(', ')}. Allowed fields: ${allowedFields.join(', ')}` 
      });
    }

    const locations = getLocationsFromFile(mapId)
    const locationIndex = locations.findIndex(item => item['id'] === id);

    // Log the update for audit purposes
    console.log(`User ${req.user.username} (ID: ${req.user.id}) updating hex ${id}, index ${locationIndex}, in map ${mapId}:`, updates);
      
    if (locationIndex !== -1) {
      locations[locationIndex] = { ...locations[locationIndex], ...updates };
    } else {
      locations.push(updates);
    }
    writeDataFile(path.join(__dirname, '..', '..', 'data', `${mapId}-data.js`), locations);
    
    res.json({ 
      success: true, 
      data: locations[locationIndex],
      message: 'Location updated successfully',
      updatedBy: req.user.username,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating data:', error);
    res.status(500).json({ error: 'Failed to update data' });
  }
});

router.delete('/maps/:mapId/locations/:id', authenticateToken, (req, res) => {
  try {
    const { mapId, id } = req.params;
    
    const locations = getLocationsFromFile(mapId)
    const locationIndex = locations.findIndex(item => item['id'] === id);

    // Log the update for audit purposes
    console.log(`User ${req.user.username} (ID: ${req.user.id}) deleting hex ${id}, index ${locationIndex}, in map ${mapId}:`);
      
    if (locationIndex !== -1) {
      locations.splice(locationIndex, 1)
    } 

    writeDataFile(path.join(__dirname, '..', '..', 'data', `${mapId}-data.js`), locations);
    
    res.json({ 
      success: true, 
      data: locations[locationIndex],
      message: 'Location deleted successfully',
      updatedBy: req.user.username,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating data:', error);
    res.status(500).json({ error: 'Failed to update data' });
  }
});

function readDataFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`Data file not found: ${filePath}`);
      return [];
    }
    
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
  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const content = `module.exports = ${JSON.stringify(data, null, 2)};`;
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Data file updated: ${filePath}`);
  } catch (error) {
    console.error('Error writing data file:', error);
    throw error;
  }
}

function obfuscateHex(hex, isAuthenticated) {
  if (isAuthenticated) return hex;

  const obfuscated = { ...hex };
  switch (obfuscated.status) {
    case 'U':
      obfuscated.name = '?';
      obfuscated.text = '[Hidden]';
      break;
    case 'K':
      obfuscated.text = '[Hidden]';
      break;
    // case 'E': no change
  }
  return obfuscated;
}

module.exports = router;