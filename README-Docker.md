# Descent into Avernus Map - Docker Setup

This Docker setup provides a single web server that serves both the player view and DM view on separate routes with authentication and CRUD capabilities.

## Quick Start

1. **Clone the repository and add the Docker files:**
   ```bash
   git clone https://github.com/NullDefault/DescentIntoAvernus.map.git
   cd DescentIntoAvernus.map
   # Add the Docker files from this setup
   ```

2. **Build and run with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Player view: http://localhost:3000/player
   - DM view: http://localhost:3000/dm (requires login)
   - DM login: http://localhost:3000/dm/login

## Default Credentials

- **Username:** `dm`
- **Password:** `secure-password-123`

**⚠️ Important: Change these credentials before deploying to production!**

## Routes

### Player Routes
- `GET /player` - Player map view (filtered data, no secrets)
- `GET /player/api/data` - Player data API (only known/explored locations)

### DM Routes
- `GET /dm/login` - DM login page
- `POST /dm/login` - Login handler
- `POST /dm/logout` - Logout handler
- `GET /dm` - DM map view (requires authentication)
- `GET /dm/locations` - DM locations page (requires authentication)

### DM API Routes (All require authentication)
- `GET /api/data` - Get all location data
- `PUT /api/data/:hex` - Update single location by hex coordinate
- `PUT /api/data` - Bulk update multiple locations

## Configuration

### Environment Variables

Set these in your `docker-compose.yml` or as environment variables:

- `SESSION_SECRET` - Session encryption key (change for production)
- `ADMIN_USERNAME` - DM login username (default: "dm")
- `ADMIN_PASSWORD` - DM login password (default: "secure-password-123")
- `PORT` - Server port (default: 3000)

### Data Management

The application automatically:
- Copies `data/data.js` to `player/data/data.js` on startup
- Synchronizes both files when DM makes updates via the API
- Filters player data to hide unexplored locations

## API Usage Examples

### Get all data (DM only)
```bash
curl -X GET http://localhost:3000/api/data \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE"
```

### Update location status (DM only)
```bash
curl -X PUT http://localhost:3000/api/data/a1 \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE" \
  -d '{"status": "E"}'
```

### Bulk update locations (DM only)
```bash
curl -X PUT http://localhost:3000/api/data \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE" \
  -d '[
    {"hex": "a1", "data": {"status": "E"}},
    {"hex": "b2", "data": {"status": "K"}}
  ]'
```

## Data Structure

The application uses the existing data.js format with the following status values:
- `"U"` - Unknown (hidden from players)
- `"K"` - Known (shown to players but no details)
- `"E"` - Explored (full details shown to players)

## Security Notes

1. **Change default credentials** before production deployment
2. **Use HTTPS** in production (set `cookie.secure: true` in session config)
3. **Set a strong SESSION_SECRET** for production
4. **Consider using a reverse proxy** (nginx) for SSL termination
5. **Backup your data.js file** regularly

## Customization

### Adding New API Endpoints

Edit `server.js` to add new CRUD endpoints. All DM API routes should use the `requireAuth` middleware:

```javascript
app.get('/api/custom-endpoint', requireAuth, (req, res) => {
  // Your custom logic here
});
```

### Modifying the Login Page

The login page HTML is embedded in the `/dm/login` route. You can extract it to a separate file if needed.

### Player Data Filtering

The player API filters data in the `/player/api/data` route. Modify this logic to change what information is available to players.

## Deployment

### Production Deployment

1. **Update environment variables** in `docker-compose.yml`
2. **Use a reverse proxy** like nginx for SSL
3. **Set up automated backups** for the data directory
4. **Monitor logs** with `docker-compose logs -f`

### Scaling

The application is stateless except for sessions. You can:
- Use Redis for session storage to enable horizontal scaling
- Mount the data directory as a shared volume across instances
- Use a load balancer for multiple instances

## Troubleshooting

### Common Issues

1. **Login not working**: Check that SESSION_SECRET is set and consistent
2. **Data not updating**: Verify file permissions on the data directory
3. **Player view showing secrets**: Check the data filtering logic in `/player/api/data`
4. **Static files not loading**: Ensure all original files are present in dm/ and player/frontend/

### Logs

View application logs:
```bash
docker-compose logs -f avernus-map
```

### Health Check

The Docker setup includes a health check. Check container health:
```bash
docker-compose ps
```

## Contributing

When adding features:
1. Maintain backward compatibility with existing data.js format
2. Add authentication to new DM-only endpoints
3. Update this README with new functionality
4. Test both player and DM views after changes
