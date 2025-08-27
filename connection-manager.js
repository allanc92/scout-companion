// Scout Connection Resilience Module
// This module handles Discord reconnections and connection stability

class ScoutConnectionManager {
  constructor(client) {
    this.client = client;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 5000; // Start with 5 seconds
    this.isReconnecting = false;
    
    this.setupConnectionHandlers();
  }
  
  setupConnectionHandlers() {
    // Handle disconnections
    this.client.on('disconnect', (event) => {
      console.warn(`⚠️ Scout disconnected! Code: ${event.code}, Reason: ${event.reason}`);
      this.handleDisconnection();
    });
    
    // Handle connection errors
    this.client.on('error', (error) => {
      console.error('❌ Discord client error:', error);
      
      // Don't reconnect for authentication errors
      if (error.code === 4004) {
        console.error('💀 Authentication failed - check DISCORD_TOKEN');
        process.exit(1);
      }
    });
    
    // Handle reconnection success
    this.client.on('ready', () => {
      if (this.reconnectAttempts > 0) {
        console.log(`🎉 Scout reconnected successfully after ${this.reconnectAttempts} attempts!`);
      }
      this.reconnectAttempts = 0;
      this.isReconnecting = false;
    });
    
    // Handle rate limit warnings
    this.client.rest.on('rateLimited', (info) => {
      console.warn(`⏰ Rate limited for ${info.timeToReset}ms on route ${info.route}`);
    });
    
    // Handle WebSocket errors
    this.client.ws.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
    });
    
    // Handle connection resumed
    this.client.on('resume', (replayed) => {
      console.log(`🔄 Connection resumed, replayed ${replayed} events`);
    });
  }
  
  async handleDisconnection() {
    if (this.isReconnecting) {
      console.log('🔄 Already attempting to reconnect...');
      return;
    }
    
    this.isReconnecting = true;
    this.reconnectAttempts++;
    
    if (this.reconnectAttempts > this.maxReconnectAttempts) {
      console.error(`💀 Max reconnection attempts (${this.maxReconnectAttempts}) reached. Exiting...`);
      process.exit(1);
    }
    
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
    console.log(`🔄 Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms...`);
    
    setTimeout(async () => {
      try {
        await this.client.login(process.env.DISCORD_TOKEN);
        console.log('✅ Reconnection attempt initiated');
      } catch (error) {
        console.error('❌ Reconnection failed:', error);
        this.isReconnecting = false;
        this.handleDisconnection(); // Try again
      }
    }, delay);
  }
  
  // Health check method
  getConnectionStatus() {
    return {
      status: this.client.readyAt ? 'connected' : 'disconnected',
      uptime: this.client.uptime,
      reconnectAttempts: this.reconnectAttempts,
      isReconnecting: this.isReconnecting,
      ping: this.client.ws.ping
    };
  }
}

module.exports = ScoutConnectionManager;
