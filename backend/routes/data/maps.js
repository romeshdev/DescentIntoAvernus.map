const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../../middleware/auth');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Public route - anyone can read map data
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

// Public route - anyone can read specific hex data
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
    console.error('Error reading data:', error);
    res.status(500).json({ error: 'Failed to read data' });
  }
});

// Protected route - only authenticated users can update hex data
router.put('/maps/:mapId/hex/:id', authenticateToken, (req, res) => {
  try {
    const { mapId, id } = req.params;
    const updates = req.body;
    
    // Add validation for update data
    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No update data provided' });
    }
    
    // Validate allowed fields (prevent unauthorized modifications)
    const allowedFields = ['name', 'text', 'status', 'item', 'terrain'];
    const updateKeys = Object.keys(updates);
    const invalidFields = updateKeys.filter(key => !allowedFields.includes(key));
    
    if (invalidFields.length > 0) {
      return res.status(400).json({ 
        error: `Invalid fields: ${invalidFields.join(', ')}. Allowed fields: ${allowedFields.join(', ')}` 
      });
    }
    
    const dataPath = path.join(__dirname, '..', '..', 'data', `${mapId}-data.js`);
    const data = readDataFile(dataPath);

    const locationIndex = data.findIndex(item => item['id'] === id);

    if (locationIndex !== -1) {
      // Log the update for audit purposes
      console.log(`User ${req.user.username} (ID: ${req.user.id}) updating hex ${id} in map ${mapId}:`, updates);
      
      // Update the location
      data[locationIndex] = { ...data[locationIndex], ...updates };
      
      // Write back to main data file
      writeDataFile(dataPath, data);
      
      // Also update player data if it exists
      const playerDataPath = path.join(__dirname, 'player', 'data', `${mapId}-data.js`);
      try {
        if (fs.existsSync(path.dirname(playerDataPath))) {
          writeDataFile(playerDataPath, data);
        }
      } catch (playerError) {
        console.warn('Could not update player data file:', playerError.message);
        // Don't fail the request if player data update fails
      }
      
      res.json({ 
        success: true, 
        data: data[locationIndex],
        message: 'Location updated successfully',
        updatedBy: req.user.username,
        updatedAt: new Date().toISOString()
      });
    } else {
      res.status(404).json({ error: 'Location not found' });
    }
  } catch (error) {
    console.error('Error updating data:', error);
    res.status(500).json({ error: 'Failed to update data' });
  }
});

// Protected route - bulk update multiple hexes (for advanced operations)
router.put('/maps/:mapId/bulk', authenticateToken, (req, res) => {
  try {
    const { mapId } = req.params;
    const { updates } = req.body; // Array of { id, data } objects
    
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ error: 'Updates must be a non-empty array' });
    }
    
    const dataPath = path.join(__dirname, '..', '..', 'data', `${mapId}-data.js`);
    const data = readDataFile(dataPath);
    
    const results = [];
    const allowedFields = ['name', 'text', 'status', 'item', 'terrain'];
    
    for (const update of updates) {
      if (!update.id || !update.data) {
        results.push({ id: update.id || 'unknown', success: false, error: 'Missing id or data' });
        continue;
      }
      
      // Validate fields
      const updateKeys = Object.keys(update.data);
      const invalidFields = updateKeys.filter(key => !allowedFields.includes(key));
      
      if (invalidFields.length > 0) {
        results.push({ 
          id: update.id, 
          success: false, 
          error: `Invalid fields: ${invalidFields.join(', ')}` 
        });
        continue;
      }
      
      const locationIndex = data.findIndex(item => item.id === update.id);
      
      if (locationIndex !== -1) {
        data[locationIndex] = { ...data[locationIndex], ...update.data };
        results.push({ id: update.id, success: true, data: data[locationIndex] });
      } else {
        results.push({ id: update.id, success: false, error: 'Location not found' });
      }
    }
    
    // Write updated data
    writeDataFile(dataPath, data);
    
    // Update player data
    const playerDataPath = path.join(__dirname, 'player', 'data', `${mapId}-data.js`);
    try {
      if (fs.existsSync(path.dirname(playerDataPath))) {
        writeDataFile(playerDataPath, data);
      }
    } catch (playerError) {
      console.warn('Could not update player data file:', playerError.message);
    }
    
    console.log(`User ${req.user.username} (ID: ${req.user.id}) performed bulk update on map ${mapId}:`, 
                `${results.filter(r => r.success).length}/${results.length} successful`);
    
    res.json({
      success: true,
      message: `Bulk update completed: ${results.filter(r => r.success).length}/${results.length} successful`,
      results,
      updatedBy: req.user.username,
      updatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in bulk update:', error);
    res.status(500).json({ error: 'Failed to perform bulk update' });
  }
});

// Protected route - get edit history/audit log (if you want to implement this later)
router.get('/maps/:mapId/history', authenticateToken, (req, res) => {
  // This could be implemented later to show edit history
  res.json({ 
    message: 'Edit history feature not yet implemented',
    mapId: req.params.mapId,
    requestedBy: req.user.username
  });
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

module.exports = router;