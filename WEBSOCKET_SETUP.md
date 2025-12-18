# WebSocket Setup Guide

## Issues Fixed

The WebSocket connection was not working due to several issues that have been fixed:

### 1. **Incorrect URL for Development**
- **Before**: Always used production URL even in development
- **After**: Uses `http://localhost:5001` for localhost, production URL otherwise

### 2. **Socket.IO Namespace Handling**
- **Before**: Manually constructing WebSocket URLs
- **After**: Properly using Socket.IO namespace `/chat` which is automatically handled

### 3. **Transport Fallback**
- **Before**: Only using `websocket` transport
- **After**: Using `['websocket', 'polling']` for better compatibility

### 4. **Authentication Headers**
- **Before**: Only passing token in `auth` object
- **After**: Also passing token in `extraHeaders` as fallback

## Environment Variables

Add these to your `.env.local` file:

```bash
# For development
NEXT_PUBLIC_WS_URL=http://localhost:5001

# For production (optional, will use NEXT_PUBLIC_USER_BASE_URL if not set)
NEXT_PUBLIC_WEBSOCKET_URL=wss://your-websocket-server.com
```

## Testing the Connection

1. Open browser console
2. Look for these log messages:
   - `[useChatSocket] Connecting to WebSocket: ...`
   - `[useChatSocket] Socket connected: ...`
   - `[useChatSocket] Server confirmed connection: ...`

3. If you see connection errors:
   - Check that the backend WebSocket server is running
   - Verify the token is valid
   - Check CORS settings on the backend
   - Ensure the WebSocket port (5001) is accessible

## Common Issues

### Connection Refused
- **Cause**: Backend WebSocket server not running
- **Fix**: Start the backend server on port 5001

### Authentication Failed
- **Cause**: Invalid or expired JWT token
- **Fix**: Re-login to get a fresh token

### CORS Errors
- **Cause**: Backend not allowing WebSocket connections from your origin
- **Fix**: Configure CORS on backend to allow your frontend URL

### Connection Timeout
- **Cause**: Network issues or firewall blocking WebSocket
- **Fix**: Check network connection, try using polling transport as fallback

## Debugging

Enable verbose logging by checking browser console for:
- Connection attempts
- Authentication status
- Error messages
- Reconnection attempts

The hook logs all important events with the `[useChatSocket]` prefix.




