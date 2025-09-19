export interface IrrigationStatus {
  isOn: boolean;
  lastUpdated: string;
  duration: number; // in minutes
  autoShutoff: boolean;
  scheduledShutoff?: string; // ISO timestamp
  sensorData?: {
    soilMoisture: number;
    temperature: number;
    humidity: number;
  };
  esp32Connected: boolean;
  waterFlow?: number; // liters per minute
  // ESP32 specific fields
  sensorValue?: number;
  motorState?: boolean;
  manualMode?: boolean;
  threshold?: number;
  moisture?: 'wet' | 'dry';
}

export interface IrrigationCommand {
  action: 'turn_on' | 'turn_off' | 'set_duration' | 'emergency_stop';
  duration?: number;
  zone?: string;
  timestamp: string;
  userId: string;
}

class HTTPIrrigationService {
  private static instance: HTTPIrrigationService;
  // Default to ESP32 Access Point IP for simplest setup
  private esp32IP: string = '192.168.4.1';
  private readonly baseURL = () => `http://${this.esp32IP}`;
  private statusListeners: ((status: IrrigationStatus | null) => void)[] = [];
  private statusPollingInterval: NodeJS.Timeout | null = null;
  private lastStatus: IrrigationStatus | null = null;

  private constructor() {}

  public static getInstance(): HTTPIrrigationService {
    if (!HTTPIrrigationService.instance) {
      HTTPIrrigationService.instance = new HTTPIrrigationService();
    }
    return HTTPIrrigationService.instance;
  }

  /**
   * Set ESP32 IP address
   */
  public setESP32IP(ip: string): void {
    this.esp32IP = ip;
    console.log(`🌐 ESP32 IP set to: ${ip}`);
    this.startStatusPolling();
  }

  /**
   * Auto-discover ESP32 on local network
   */
  public async discoverESP32(): Promise<string | null> {
    console.log('🔍 Starting ESP32 discovery...');
    
    // Try common ESP32 IP addresses first
    const commonIPs = [
      '192.168.1.100', '192.168.1.101', '192.168.1.102',
      '192.168.4.1',   // ESP32 AP mode default
      '192.168.0.100', '192.168.0.101', '192.168.0.102',
    ];
    
    // Test common IPs first
    for (const testIP of commonIPs) {
      console.log(`Testing IP: ${testIP}`);
      
      try {
        // Create timeout promise
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 3000)
        );
        
        const fetchPromise = fetch(`http://${testIP}/status`, {
          method: 'GET',
        });
        
        const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
        
        if (response.ok) {
          const data = await response.json();
          if (data.sensorValue !== undefined) {
            console.log(`✅ Found ESP32 at: ${testIP}`);
            this.setESP32IP(testIP);
            return testIP;
          }
        }
      } catch (error) {
        // Continue trying other IPs
        console.log(`❌ ${testIP} failed`);
      }
    }
    
    console.log('❌ ESP32 not found at common addresses');
    return null;
  }

  /**
   * Get local device IP (simplified)
   */
  private async getLocalIP(): Promise<string | null> {
    // This is a simplified approach - in real app you'd use react-native-device-info
    // For now, return common local network base
    return '192.168.1.100'; // User will need to set correct IP manually
  }

  /**
   * Make HTTP request to ESP32
   */
  private async makeRequest(endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any): Promise<any> {
    if (!this.esp32IP) {
      throw new Error('ESP32 IP not set. Call setESP32IP() first.');
    }

    const url = `${this.baseURL()}${endpoint}`;
    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };
      if (data && method === 'POST') {
        options.body = JSON.stringify(data);
      }

      // Manual timeout of 5 seconds to avoid spinner forever
      const timeoutPromise = new Promise<Response>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 5000)
      );
      const fetchPromise = fetch(url, options);
      const response = (await Promise.race([fetchPromise, timeoutPromise])) as Response;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      const msg = (err as Error).message || String(err);
      console.error(`Request failed ${method} ${url}: ${msg}`);
      throw err;
    }
  }

  /**
   * Turn irrigation system ON
   */
  public async turnOn(duration: number = 30, zone: string = 'main'): Promise<void> {
    try {
      const command = {
        manual: true,
        motor: true,
        duration: duration,
        timestamp: new Date().toISOString(),
      };

      await this.makeRequest('/control', 'POST', command);
      console.log(`🚿 Irrigation turned ON for ${duration} minutes`);
      
      // Auto-shutoff after duration
      if (duration > 0) {
        setTimeout(async () => {
          await this.turnOff();
        }, duration * 60000);
      }
    } catch (error) {
      console.error('Error turning irrigation ON:', error);
      throw new Error('Failed to turn irrigation ON');
    }
  }

  /**
   * Turn irrigation system OFF
   */
  public async turnOff(zone: string = 'main'): Promise<void> {
    try {
      const command = {
        manual: true,
        motor: false,
        timestamp: new Date().toISOString(),
      };

      await this.makeRequest('/control', 'POST', command);
      console.log('🛑 Irrigation turned OFF');
    } catch (error) {
      console.error('Error turning irrigation OFF:', error);
      throw new Error('Failed to turn irrigation OFF');
    }
  }

  /**
   * Emergency stop - immediately stops all irrigation
   */
  public async emergencyStop(): Promise<void> {
    try {
      await this.turnOff();
      console.log('🚨 Emergency stop activated');
    } catch (error) {
      console.error('Error in emergency stop:', error);
      throw error;
    }
  }

  /**
   * Enable/Disable automatic mode
   */
  public async setAutoMode(enabled: boolean): Promise<void> {
    try {
      const command = {
        manual: !enabled,
        timestamp: new Date().toISOString(),
      };

      await this.makeRequest('/control', 'POST', command);
      console.log(`🤖 Auto mode ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error setting auto mode:', error);
      throw new Error('Failed to set auto mode');
    }
  }

  /**
   * Get current irrigation status
   */
  public async getStatus(): Promise<IrrigationStatus | null> {
    try {
      const data = await this.makeRequest('/status', 'GET');
      
      // Convert ESP32 response to our status format
      const status: IrrigationStatus = {
        isOn: data.motorState || false,
        lastUpdated: new Date().toISOString(),
        duration: 0, // ESP32 doesn't track duration
        autoShutoff: !data.manualMode,
        esp32Connected: true,
        sensorData: {
          soilMoisture: data.sensorValue || 0,
          temperature: 0, // Not available yet
          humidity: 0,    // Not available yet
        },
        // ESP32 specific fields
        sensorValue: data.sensorValue,
        motorState: data.motorState,
        manualMode: data.manualMode,
        threshold: data.threshold,
        moisture: data.moisture,
      };

      this.lastStatus = status;
      return status;
    } catch (error) {
      console.error('Error getting irrigation status:', error);
      
      // Return offline status
      return {
        isOn: false,
        lastUpdated: new Date().toISOString(),
        duration: 0,
        autoShutoff: true,
        esp32Connected: false,
      };
    }
  }

  /**
   * Listen to real-time status updates (via polling)
   */
  public onStatusChange(callback: (status: IrrigationStatus | null) => void): () => void {
    this.statusListeners.push(callback);
    
    // Send current status immediately
    if (this.lastStatus) {
      callback(this.lastStatus);
    }

    // Return unsubscribe function
    return () => {
      const index = this.statusListeners.indexOf(callback);
      if (index > -1) {
        this.statusListeners.splice(index, 1);
      }
    };
  }

  /**
   * Start polling for status updates
   */
  private startStatusPolling(): void {
    if (this.statusPollingInterval) {
      clearInterval(this.statusPollingInterval);
    }

    this.statusPollingInterval = setInterval(async () => {
      try {
        const status = await this.getStatus();
        
        // Notify all listeners
        this.statusListeners.forEach(callback => {
          callback(status);
        });
      } catch (error) {
        console.error('Status polling error:', error);
      }
    }, 2000); // Poll every 2 seconds
  }

  /**
   * Stop status polling
   */
  public stopStatusPolling(): void {
    if (this.statusPollingInterval) {
      clearInterval(this.statusPollingInterval);
      this.statusPollingInterval = null;
    }
  }

  /**
   * Check ESP32 connection status
   */
  public async checkESP32Connection(): Promise<boolean> {
    try {
      await this.makeRequest('/status', 'GET');
      return true;
    } catch (error) {
      console.warn('ESP32 not reachable at', this.baseURL());
      return false;
    }
  }

  /**
   * Initialize irrigation system status
   */
  public async initializeSystem(): Promise<void> {
    console.log('🔧 HTTP Irrigation system initializing (AP mode)...');
    // Try direct connection to default AP IP only
    const connectionTimeout = new Promise<boolean>((resolve) =>
      setTimeout(() => resolve(false), 5000)
    );
    const isConnected = await Promise.race([
      this.checkESP32Connection(),
      connectionTimeout,
    ]);

    if (isConnected) {
      console.log('✅ ESP32 connected at', this.baseURL());
      this.startStatusPolling();
    } else {
      console.log('❌ Could not reach ESP32 at', this.baseURL());
    }
  }

  // Legacy methods for compatibility (not implemented for HTTP)
  public async createSchedule(): Promise<string> {
    throw new Error('Scheduling not implemented in HTTP mode');
  }

  public async getSchedules(): Promise<any[]> {
    return [];
  }

  public async deleteSchedule(): Promise<void> {
    throw new Error('Scheduling not implemented in HTTP mode');
  }

  public async updateSensorData(): Promise<void> {
    // Not needed - data comes from ESP32 directly
  }
}

export default HTTPIrrigationService.getInstance();