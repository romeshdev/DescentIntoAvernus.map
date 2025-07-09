const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Serve static files for DM view
app.use('/dm', express.static(path.join(__dirname, 'dm')));

// Serve static files for player view
app.use('/player/static', express.static(path.join(__dirname, 'player/frontend')));

// Serve shared data file
app.use('/data', express.static(path.join(__dirname, 'data')));

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (req.session.authenticated) {
    next();
  } else {
    res.redirect('/dm/login');
  }
};

// Helper function to read and parse data.js
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

// Helper function to write data.js
function writeDataFile(filePath, data) {
  const content = `module.exports = ${JSON.stringify(data, null, 2)};`;
  fs.writeFileSync(filePath, content, 'utf8');
}

// Routes

// Root redirect
app.get('/', (req, res) => {
  res.redirect('/player');
});

// DM Login page
app.get('/dm/login', (req, res) => {
  const dmLoginPath = path.join(__dirname, 'dm', 'login.html');
  if (fs.existsSync(dmLoginPath)) {
    res.sendFile(dmLoginPath);
  } else {
    res.send(`page not found`);
  }
});

// DM Login handler
app.post('/dm/login', (req, res) => {
  const { username, password } = req.body;
  
  // Hard-coded credentials (change these!)
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'dm';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'pwd';
  
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    req.session.authenticated = true;
    res.redirect('/dm');
  } else {
    res.redirect('/dm/login?error=1');
  }
});

// DM Logout
app.post('/dm/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/dm/login');
});

// Protected DM routes
app.get('/dm', requireAuth, (req, res) => {
  const dmIndexPath = path.join(__dirname, 'dm', 'index.html');
  if (fs.existsSync(dmIndexPath)) {
    res.sendFile(dmIndexPath);
  } else {
    res.send(`page not found`);
  }
});

app.get('/dm/locations', requireAuth, (req, res) => {
  const dmLocationsPath = path.join(__dirname, 'dm', 'avernus.html');
  if (fs.existsSync(dmLocationsPath)) {
    res.sendFile(dmLocationsPath);
  } else {
    res.sendFile(path.join(__dirname, 'locations.html'));
  }
});

// DM API - Get all data
app.get('/api/data', requireAuth, (req, res) => {
  try {
    const dataPath = path.join(__dirname, 'data', 'data.js');
    const data = readDataFile(dataPath);
    res.json(data);
  } catch (error) {
    console.error('Error reading data:', error);
    res.status(500).json({ error: 'Failed to read data file' });
  }
});

// DM API - Update single location
app.put('/api/data/:hex', requireAuth, (req, res) => {
  try {
    const { hex } = req.params;
    const updates = req.body;
    
    const dataPath = path.join(__dirname, 'data', 'data.js');
    const data = readDataFile(dataPath);
    
    const locationIndex = data.findIndex(item => item.hex === hex);
    
    if (locationIndex !== -1) {
      // Update the location
      data[locationIndex] = { ...data[locationIndex], ...updates };
      
      // Write back to main data file
      writeDataFile(dataPath, data);
      
      // Also update player data
      const playerDataPath = path.join(__dirname, 'player', 'data', 'data.js');
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

// DM API - Bulk update locations
app.put('/api/data', requireAuth, (req, res) => {
  try {
    const updates = req.body; // Array of objects with hex and data
    
    const dataPath = path.join(__dirname, 'data', 'data.js');
    const data = readDataFile(dataPath);
    
    updates.forEach(update => {
      const locationIndex = data.findIndex(item => item.hex === update.hex);
      if (locationIndex !== -1) {
        data[locationIndex] = { ...data[locationIndex], ...update.data };
      }
    });
    
    // Write back to main data file
    writeDataFile(dataPath, data);
    
    // Also update player data
    const playerDataPath = path.join(__dirname, 'player', 'data', 'data.js');
    if (fs.existsSync(path.dirname(playerDataPath))) {
      writeDataFile(playerDataPath, data);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating data:', error);
    res.status(500).json({ error: 'Failed to update data' });
  }
});


// Player view routes
app.get('/player', (req, res) => {
  const playerIndexPath = path.join(__dirname, 'player', 'frontend', 'index.html');
  if (fs.existsSync(playerIndexPath)) {
    res.sendFile(playerIndexPath);
  } else {
    res.sendFile(path.join(__dirname, 'player', 'player.html'));
  }
});

// Player API - Get filtered data (only known/explored locations)
app.get('/player/api/data', (req, res) => {
  try {
    const dataPath = path.join(__dirname, 'player', 'data', 'data.js');
    const dataContent = fs.readFileSync(dataPath, 'utf8');
    const jsonMatch = dataContent.match(/module\.exports\s*=\s*(\[[\s\S]*\])/);
    
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[1]);
      // Filter out unknown locations (status !== 'U')
      const filteredData = data; //.filter(item => !item.status || item.status !== 'U');
      
      // Remove DM-only information from player view
      const playerData = filteredData.map(item => {
        const playerItem = { ...item };
        // Remove detailed text for unexplored locations
        if (item.status === 'K') {
          playerItem.text = ''; // Known but not explored - no details
        }
        return playerItem;
      });
      
      res.json(playerData);
    } else {
      res.status(500).json({ error: 'Failed to parse data file' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to read data file' });
  }
});


// let quests = require("./data/quests.js");

//Filter data. Hides from the user the location text (hex key), the terrain information and any item (dream machine component)
//If a location hasn't been explored (status == 'U' as Unexplored) filters out the name as well
app.post("/data/locations", function (req, res) {
    let locations = require("./data/data.js"); //Importing dataset
  locations.forEach((i) => {
    if(i.status == "U"){
        i.name = "?";
        i.text = "?";
        i.terrain = "?";
        i.item = "?";
    }
  });

  res.send(locations);
});

// app.post("/data/quests", function (req, res) {
//   const addExpandedProperty = (items) => {
//     return items.map((item) => {
//       const newItem = { ...item, expanded: false };

//       if (newItem.children) {
//         newItem.children = addExpandedProperty(newItem.children, false);
//       }

//       return newItem;
//     });
//   };

//   const questsExpanded = addExpandedProperty(quests);
//   res.send(questsExpanded);
// });

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Player view: http://localhost:${PORT}/player`);
  console.log(`DM view: http://localhost:${PORT}/dm`);
  console.log(`DM login: http://localhost:${PORT}/dm/login`);
  
  // Ensure player data file exists
  const dataPath = path.join(__dirname, 'data', 'data.js');
  const playerDataPath = path.join(__dirname, 'player', 'data', 'data.js');
  
  if (fs.existsSync(dataPath) && !fs.existsSync(playerDataPath)) {
    console.log('Copying data.js to player directory...');
    fs.copyFileSync(dataPath, playerDataPath);
  }
});