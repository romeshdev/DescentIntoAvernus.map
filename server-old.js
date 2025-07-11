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

// Routes

// Root redirect
app.get('/', (req, res) => {
  res.redirect('/player');
});

// DM Login page
app.get('/dm/login', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>DM Login</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          max-width: 400px; 
          margin: 100px auto; 
          padding: 20px;
          background-color: #1a1a1a;
          color: #ffffff;
        }
        .login-form {
          background-color: #2a2a2a;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        }
        h1 { 
          text-align: center; 
          color: #ff6b6b;
          margin-bottom: 30px;
        }
        input { 
          width: 100%; 
          padding: 10px; 
          margin: 10px 0; 
          border: 1px solid #555;
          border-radius: 5px;
          background-color: #3a3a3a;
          color: #ffffff;
          box-sizing: border-box;
        }
        button { 
          width: 100%; 
          padding: 12px; 
          background-color: #ff6b6b; 
          color: white; 
          border: none; 
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
        }
        button:hover { 
          background-color: #ff5252; 
        }
        .error { 
          color: #ff6b6b; 
          margin-top: 10px;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="login-form">
        <h1>DM Access</h1>
        <form method="POST" action="/dm/login">
          <input type="text" name="username" placeholder="Username" required>
          <input type="password" name="password" placeholder="Password" required>
          <button type="submit">Login</button>
        </form>
        ${req.query.error ? '<div class="error">Invalid credentials</div>' : ''}
      </div>
    </body>
    </html>
  `);
});

// DM Login handler
app.post('/dm/login', (req, res) => {
  const { username, password } = req.body;
  
  // Hard-coded credentials (change these!)
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'dm';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password123';
  
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
// app.get('/dm', requireAuth, (req, res) => {
//   const dmIndexPath = path.join(__dirname, 'dm', 'index.html');
//   if (fs.existsSync(dmIndexPath)) {
//     res.sendFile(dmIndexPath);
//   } else {
//     res.send(`
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <title>DM Dashboard</title>
//         <style>
//           body { 
//             font-family: Arial, sans-serif; 
//             max-width: 800px; 
//             margin: 50px auto; 
//             padding: 20px;
//             background-color: #1a1a1a;
//             color: #ffffff;
//           }
//           .dashboard {
//             background-color: #2a2a2a;
//             padding: 30px;
//             border-radius: 10px;
//             box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
//           }
//           h1 { color: #ff6b6b; }
//           .nav-links a {
//             display: inline-block;
//             margin: 10px 15px 10px 0;
//             padding: 10px 20px;
//             background-color: #ff6b6b;
//             color: white;
//             text-decoration: none;
//             border-radius: 5px;
//           }
//           .nav-links a:hover { background-color: #ff5252; }
//           .api-section {
//             margin-top: 30px;
//             padding: 20px;
//             background-color: #333;
//             border-radius: 5px;
//           }
//           pre {
//             background-color: #1a1a1a;
//             padding: 15px;
//             border-radius: 5px;
//             overflow-x: auto;
//           }
//         </style>
//       </head>
//       <body>
//         <div class="dashboard">
//           <h1>DM Dashboard</h1>
//           <p>Welcome to the Descent into Avernus Map DM Interface</p>
          
//           <div class="nav-links">
//             <a href="/dm/locations">Locations</a>
//             <a href="/player" target="_blank">Player View</a>
//             <form method="POST" action="/dm/logout" style="display: inline;">
//               <button type="submit" style="background-color: #666; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Logout</button>
//             </form>
//           </div>
          
//           <div class="api-section">
//             <h3>API Endpoints</h3>
//             <p><strong>GET /api/data</strong> - Get all location data</p>
//             <p><strong>PUT /api/data/:hex</strong> - Update single location</p>
//             <p><strong>PUT /api/data</strong> - Bulk update locations</p>
            
//             <h4>Example: Mark location as explored</h4>
//             <pre>curl -X PUT http://localhost:3000/api/data/a1 \\
//   -H "Content-Type: application/json" \\
//   -H "Cookie: connect.sid=YOUR_SESSION_COOKIE" \\
//   -d '{"status": "E"}'</pre>
//           </div>
//         </div>
//       </body>
//       </html>
//     `);
//   }
// });

// app.get('/dm/locations', requireAuth, (req, res) => {
//   const dmLocationsPath = path.join(__dirname, 'dm', 'locations.html');
//   if (fs.existsSync(dmLocationsPath)) {
//     res.sendFile(dmLocationsPath);
//   } else {
//     res.send(`
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <title>DM Locations</title>
//         <style>
//           body { 
//             font-family: Arial, sans-serif; 
//             max-width: 1200px; 
//             margin: 20px auto; 
//             padding: 20px;
//             background-color: #1a1a1a;
//             color: #ffffff;
//           }
//           .header {
//             background-color: #2a2a2a;
//             padding: 20px;
//             border-radius: 10px;
//             margin-bottom: 20px;
//           }
//           h1 { color: #ff6b6b; }
//           .nav-links a {
//             margin-right: 15px;
//             padding: 8px 16px;
//             background-color: #ff6b6b;
//             color: white;
//             text-decoration: none;
//             border-radius: 5px;
//           }
//           .locations-grid {
//             display: grid;
//             grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
//             gap: 20px;
//           }
//           .location-card {
//             background-color: #2a2a2a;
//             padding: 20px;
//             border-radius: 10px;
//             border: 1px solid #444;
//           }
//           .location-hex {
//             font-weight: bold;
//             color: #ff6b6b;
//             font-size: 1.2em;
//           }
//           .location-status {
//             padding: 4px 8px;
//             border-radius: 3px;
//             font-size: 0.9em;
//             margin-left: 10px;
//           }
//           .status-U { background-color: #666; }
//           .status-K { background-color: #ff9800; }
//           .status-E { background-color: #4caf50; }
//           .terrain { color: #ccc; font-style: italic; }
//         </style>
//       </head>
//       <body>
//         <div class="header">
//           <h1>Location Manager</h1>
//           <div class="nav-links">
//             <a href="/dm">Dashboard</a>
//             <a href="/player" target="_blank">Player View</a>
//             <form method="POST" action="/dm/logout" style="display: inline;">
//               <button type="submit" style="background-color: #666; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer;">Logout</button>
//             </form>
//           </div>
//         </div>
        
//         <div id="locations-container">
//           <p>Loading locations...</p>
//         </div>
        
//         <script>
//           // Fetch and display locations
//           fetch('/api/data')
//             .then(response => response.json())
//             .then(data => {
//               const container = document.getElementById('locations-container');
//               container.innerHTML = '';
              
//               if (data.length === 0) {
//                 container.innerHTML = '<p>No locations found. Make sure your data.js file is properly formatted.</p>';
//                 return;
//               }
              
//               const grid = document.createElement('div');
//               grid.className = 'locations-grid';
              
//               data.forEach(location => {
//                 const card = document.createElement('div');
//                 card.className = 'location-card';
                
//                 const status = location.status || 'U';
//                 const statusText = status === 'U' ? 'Unknown' : status === 'K' ? 'Known' : 'Explored';
                
//                 card.innerHTML = \`
//                   <div class="location-hex">\${location.hex.toUpperCase()}</div>
//                   <h3>\${location.name}</h3>
//                   <div class="terrain">Terrain: \${location.terrain.join(', ')}</div>
//                   <div>Status: <span class="location-status status-\${status}">\${statusText}</span></div>
//                   \${location.item ? \`<div>Item: \${location.item}</div>\` : ''}
//                   <div style="margin-top: 10px;">
//                     <button onclick="updateStatus('\${location.hex}', 'U')" style="background-color: #666; color: white; border: none; padding: 5px 10px; margin: 2px; border-radius: 3px; cursor: pointer;">Unknown</button>
//                     <button onclick="updateStatus('\${location.hex}', 'K')" style="background-color: #ff9800; color: white; border: none; padding: 5px 10px; margin: 2px; border-radius: 3px; cursor: pointer;">Known</button>
//                     <button onclick="updateStatus('\${location.hex}', 'E')" style="background-color: #4caf50; color: white; border: none; padding: 5px 10px; margin: 2px; border-radius: 3px; cursor: pointer;">Explored</button>
//                   </div>
//                 \`;
                
//                 grid.appendChild(card);
//               });
              
//               container.appendChild(grid);
//             })
//             .catch(error => {
//               console.error('Error loading locations:', error);
//               document.getElementById('locations-container').innerHTML = '<p>Error loading locations. Check console for details.</p>';
//             });
            
//           // Update location status
//           function updateStatus(hex, status) {
//             fetch(\`/api/data/\${hex}\`, {
//               method: 'PUT',
//               headers: {
//                 'Content-Type': 'application/json',
//               },
//               body: JSON.stringify({ status: status })
//             })
//             .then(response => response.json())
//             .then(data => {
//               if (data.success) {
//                 location.reload(); // Refresh the page to show updated status
//               } else {
//                 alert('Error updating status: ' + (data.error || 'Unknown error'));
//               }
//             })
//             .catch(error => {
//               console.error('Error updating status:', error);
//               alert('Error updating status');
//             });
//           }
//         </script>
//       </body>
//       </html>
//     `);
//   }
// });

// DM API - Get all data
app.get('/api/data', requireAuth, (req, res) => {
  try {

    let locations = require("./data/data.js"); 
    res.send(locations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read data file' });
  }
});

// DM API - Update single location
// app.put('/api/data/:hex', requireAuth, (req, res) => {
//   try {
//     const { hex } = req.params;
//     const updates = req.body;
    
//     const dataPath = path.join(__dirname, 'data', 'data.js');
//     const dataContent = fs.readFileSync(dataPath, 'utf8');
//     const jsonMatch = dataContent.match(/module\.exports\s*=\s*(\[[\s\S]*\])/);
    
//     if (jsonMatch) {
//       const data = JSON.parse(jsonMatch[1]);
//       const locationIndex = data.findIndex(item => item.hex === hex);
      
//       if (locationIndex !== -1) {
//         // Update the location
//         data[locationIndex] = { ...data[locationIndex], ...updates };
        
//         // Write back to file
//         const newContent = `module.exports = ${JSON.stringify(data, null, 2)};`;
//         fs.writeFileSync(dataPath, newContent, 'utf8');
        
//         // Also update player data
//         const playerDataPath = path.join(__dirname, 'player', 'data', 'data.js');
//         fs.writeFileSync(playerDataPath, newContent, 'utf8');
        
//         res.json({ success: true, data: data[locationIndex] });
//       } else {
//         res.status(404).json({ error: 'Location not found' });
//       }
//     } else {
//       res.status(500).json({ error: 'Failed to parse data file' });
//     }
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to update data' });
//   }
// });

// DM API - Bulk update locations (for status changes)
app.put('/api/data', requireAuth, (req, res) => {
  try {
    const updates = req.body; // Array of objects with hex and updates
    
    const dataPath = path.join(__dirname, 'data', 'data.js');
    const dataContent = fs.readFileSync(dataPath, 'utf8');
    const jsonMatch = dataContent.match(/module\.exports\s*=\s*(\[[\s\S]*\])/);
    
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[1]);
      
      updates.forEach(update => {
        const locationIndex = data.findIndex(item => item.hex === update.hex);
        if (locationIndex !== -1) {
          data[locationIndex] = { ...data[locationIndex], ...update.data };
        }
      });
      
      // Write back to file
      const newContent = `module.exports = ${JSON.stringify(data, null, 2)};`;
      fs.writeFileSync(dataPath, newContent, 'utf8');
      
      // Also update player data
      const playerDataPath = path.join(__dirname, 'player', 'data', 'data.js');
      fs.writeFileSync(playerDataPath, newContent, 'utf8');
      
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Failed to parse data file' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update data' });
  }
});

// Player view routes
app.get('/player', (req, res) => {
  const playerIndexPath = path.join(__dirname, 'player', 'frontend', 'index.html');
  if (fs.existsSync(playerIndexPath)) {
    res.sendFile(playerIndexPath);
  } else {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Descent into Avernus - Player Map</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d1810 100%);
            color: #ffffff;
            min-height: 100vh;
            overflow-x: hidden;
          }
          
          .header {
            background: linear-gradient(90deg, #8B0000 0%, #DC143C 100%);
            padding: 20px;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            position: relative;
            overflow: hidden;
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="flames" patternUnits="userSpaceOnUse" width="20" height="20"><path d="M10 0 Q15 5 10 10 Q5 5 10 0" fill="rgba(255,140,0,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23flames)"/></svg>');
            opacity: 0.3;
          }
          
          .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
            position: relative;
            z-index: 1;
          }
          
          .header p {
            font-size: 1.2em;
            opacity: 0.9;
            position: relative;
            z-index: 1;
          }
          
          .map-container {
            padding: 30px;
            max-width: 1200px;
            margin: 0 auto;
          }
          
          .map-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            margin-top: 20px;
          }
          
          .location-card {
            background: linear-gradient(145deg, #2a2a2a 0%, #1e1e1e 100%);
            border: 2px solid #444;
            border-radius: 15px;
            padding: 20px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
          }
          
          .location-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #ff6b6b, #ff8e8e, #ff6b6b);
            border-radius: 15px 15px 0 0;
          }
          
          .location-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 35px rgba(255, 107, 107, 0.2);
            border-color: #ff6b6b;
          }
          
          .location-hex {
            font-weight: bold;
            color: #ff6b6b;
            font-size: 1.4em;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          
          .location-name {
            font-size: 1.3em;
            margin-bottom: 15px;
            color: #ffffff;
            font-weight: 600;
          }
          
          .location-terrain {
            color: #ccc;
            font-style: italic;
            margin-bottom: 10px;
            font-size: 0.95em;
          }
          
          .location-status {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: 500;
            display: inline-block;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .status-K {
            background: linear-gradient(135deg, #ff9800, #f57c00);
            color: white;
            box-shadow: 0 2px 10px rgba(255, 152, 0, 0.3);
          }
          
          .status-E {
            background: linear-gradient(135deg, #4caf50, #2e7d32);
            color: white;
            box-shadow: 0 2px 10px rgba(76, 175, 80, 0.3);
          }
          
          .location-description {
            line-height: 1.6;
            color: #ddd;
            font-size: 0.95em;
            max-height: 120px;
            overflow-y: auto;
            margin-bottom: 10px;
          }
          
          .location-item {
            background: linear-gradient(135deg, #6a1b9a, #8e24aa);
            color: white;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 0.9em;
            margin-top: 10px;
            display: inline-block;
            box-shadow: 0 2px 8px rgba(106, 27, 154, 0.3);
          }
          
          .loading {
            text-align: center;
            padding: 50px;
            font-size: 1.2em;
            color: #ccc;
          }
          
          .error {
            text-align: center;
            padding: 50px;
            color: #ff6b6b;
            font-size: 1.1em;
          }
          
          .hex-pattern {
            position: absolute;
            top: 10px;
            right: 10px;
            width: 30px;
            height: 30px;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="50,0 93.3,25 93.3,75 50,100 6.7,75 6.7,25" fill="none" stroke="rgba(255,107,107,0.3)" stroke-width="2"/></svg>');
            opacity: 0.6;
          }
          
          .stats {
            display: flex;
            justify-content: space-around;
            margin-bottom: 30px;
            padding: 20px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            backdrop-filter: blur(10px);
          }
          
          .stat {
            text-align: center;
          }
          
          .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: #ff6b6b;
            margin-bottom: 5px;
          }
          
          .stat-label {
            font-size: 0.9em;
            color: #ccc;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          @media (max-width: 768px) {
            .map-grid {
              grid-template-columns: 1fr;
            }
            
            .header h1 {
              font-size: 2em;
            }
            
            .stats {
              flex-direction: column;
              gap: 15px;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔥 Descent into Avernus 🔥</h1>
          <p>Explore the First Layer of Hell</p>
        </div>
        
        <div class="map-container">
          <div class="stats" id="stats">
            <div class="stat">
              <div class="stat-number" id="explored-count">0</div>
              <div class="stat-label">Explored</div>
            </div>
            <div class="stat">
              <div class="stat-number" id="known-count">0</div>
              <div class="stat-label">Known</div>
            </div>
            <div class="stat">
              <div class="stat-number" id="total-count">0</div>
              <div class="stat-label">Total Visible</div>
            </div>
          </div>
          
          <div id="map-content">
            <div class="loading">Loading map data...</div>
          </div>
        </div>
        
        <script>
          // Fetch and display player data
          fetch('/player/api/data')
            .then(response => response.json())
            .then(data => {
              const container = document.getElementById('map-content');
              
              if (data.length === 0) {
                container.innerHTML = '<div class="error">No locations available. Your journey through Avernus has not yet begun...</div>';
                return;
              }
              
              // Update stats
              const exploredCount = data.filter(loc => loc.status === 'E').length;
              const knownCount = data.filter(loc => loc.status === 'K').length;
              const totalCount = data.length;
              
              document.getElementById('explored-count').textContent = exploredCount;
              document.getElementById('known-count').textContent = knownCount;
              document.getElementById('total-count').textContent = totalCount;
              
              // Create map grid
              const grid = document.createElement('div');
              grid.className = 'map-grid';
              
              data.forEach(location => {
                const card = document.createElement('div');
                card.className = 'location-card';
                
                const status = location.status || 'K';
                const statusText = status === 'K' ? 'Known' : 'Explored';
                
                card.innerHTML = \`
                  <div class="hex-pattern"></div>
                  <div class="location-hex">\${location.hex.toUpperCase()}</div>
                  <div class="location-name">\${location.name}</div>
                  <div class="location-terrain">🏔️ \${location.terrain.join(', ')}</div>
                  <div class="location-status status-\${status}">\${statusText}</div>
                  \${location.text && status === 'E' ? \`<div class="location-description">\${location.text.substring(0, 200)}...</div>\` : ''}
                  \${location.item ? \`<div class="location-item">📦 \${location.item}</div>\` : ''}
                \`;
                
                grid.appendChild(card);
              });
              
              container.innerHTML = '';
              container.appendChild(grid);
            })
            .catch(error => {
              console.error('Error loading map data:', error);
              document.getElementById('map-content').innerHTML = '<div class="error">Failed to load map data. The fires of Avernus obscure your vision...</div>';
            });
        </script>
      </body>
      </html>
    `);
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
      const filteredData = data.filter(item => !item.status || item.status !== 'U');
      
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