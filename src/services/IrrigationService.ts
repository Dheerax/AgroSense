import FirebaseService from './FirebaseService';

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
}

export interface IrrigationSchedule {
  id: string;
  name: string;
  startTime: string; // HH:MM format
  duration: number; // in minutes
  days: string[]; // ['monday', 'wednesday', 'friday']
  isActive: boolean;
  zones?: string[]; // for multiple irrigation zones
}

export interface IrrigationCommand {
  action: 'turn_on' | 'turn_off' | 'set_duration' | 'emergency_stop';
  duration?: number;
  zone?: string;
  timestamp: string;
  userId: string;
}

class IrrigationService {
  private static instance: IrrigationService;
  private database = FirebaseService.getDatabase();
  private readonly IRRIGATION_PATH = 'irrigation_system';
  private readonly COMMANDS_PATH = 'irrigation_commands';
  private readonly STATUS_PATH = 'irrigation_status';
  private readonly SCHEDULES_PATH = 'irrigation_schedules';

  private constructor() {}

  public static getInstance(): IrrigationService {
    if (!IrrigationService.instance) {
      IrrigationService.instance = new IrrigationService();
    }
    return IrrigationService.instance;
  }

  /**
   * Turn irrigation system ON
   */
  public async turnOn(duration: number = 30, zone: string = 'main'): Promise<void> {
    try {
      const command: IrrigationCommand = {
        action: 'turn_on',
        duration,
        zone,
        timestamp: new Date().toISOString(),
        userId: 'app_user', // You can integrate with user authentication later
      };

      // Send command to ESP32
      await this.database.ref(`${this.COMMANDS_PATH}/latest`).set(command);
      
      // Update status
      const status: Partial<IrrigationStatus> = {
        isOn: true,
        lastUpdated: new Date().toISOString(),
        duration,
        autoShutoff: true,
        scheduledShutoff: new Date(Date.now() + duration * 60000).toISOString(),
      };

      await this.database.ref(`${this.STATUS_PATH}`).update(status);
      
      console.log(`🚿 Irrigation turned ON for ${duration} minutes`);
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
      const command: IrrigationCommand = {
        action: 'turn_off',
        zone,
        timestamp: new Date().toISOString(),
        userId: 'app_user',
      };

      // Send command to ESP32
      await this.database.ref(`${this.COMMANDS_PATH}/latest`).set(command);
      
      // Update status
      const status: Partial<IrrigationStatus> = {
        isOn: false,
        lastUpdated: new Date().toISOString(),
        scheduledShutoff: undefined,
      };

      await this.database.ref(`${this.STATUS_PATH}`).update(status);
      
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
      const command: IrrigationCommand = {
        action: 'emergency_stop',
        timestamp: new Date().toISOString(),
        userId: 'app_user',
      };

      await this.database.ref(`${this.COMMANDS_PATH}/emergency`).set(command);
      await this.turnOff();
      
      console.log('🚨 Emergency stop activated');
    } catch (error) {
      console.error('Error in emergency stop:', error);
      throw error;
    }
  }

  /**
   * Get current irrigation status
   */
  public async getStatus(): Promise<IrrigationStatus | null> {
    try {
      const snapshot = await this.database.ref(`${this.STATUS_PATH}`).once('value');
      return snapshot.val();
    } catch (error) {
      console.error('Error getting irrigation status:', error);
      return null;
    }
  }

  /**
   * Listen to real-time status updates
   */
  public onStatusChange(callback: (status: IrrigationStatus | null) => void): () => void {
    const statusRef = this.database.ref(`${this.STATUS_PATH}`);
    
    const listener = statusRef.on('value', (snapshot) => {
      const status = snapshot.val();
      callback(status);
    });

    // Return unsubscribe function
    return () => statusRef.off('value', listener);
  }

  /**
   * Create irrigation schedule
   */
  public async createSchedule(schedule: Omit<IrrigationSchedule, 'id'>): Promise<string> {
    try {
      const scheduleRef = this.database.ref(`${this.SCHEDULES_PATH}`).push();
      const scheduleId = scheduleRef.key!;
      
      const newSchedule: IrrigationSchedule = {
        ...schedule,
        id: scheduleId,
      };

      await scheduleRef.set(newSchedule);
      console.log('📅 Irrigation schedule created:', scheduleId);
      return scheduleId;
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw new Error('Failed to create irrigation schedule');
    }
  }

  /**
   * Get all schedules
   */
  public async getSchedules(): Promise<IrrigationSchedule[]> {
    try {
      const snapshot = await this.database.ref(`${this.SCHEDULES_PATH}`).once('value');
      const schedules = snapshot.val();
      
      if (!schedules) return [];
      
      return Object.values(schedules) as IrrigationSchedule[];
    } catch (error) {
      console.error('Error getting schedules:', error);
      return [];
    }
  }

  /**
   * Delete schedule
   */
  public async deleteSchedule(scheduleId: string): Promise<void> {
    try {
      await this.database.ref(`${this.SCHEDULES_PATH}/${scheduleId}`).remove();
      console.log('🗑️ Irrigation schedule deleted:', scheduleId);
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw new Error('Failed to delete irrigation schedule');
    }
  }

  /**
   * Update sensor data (called by ESP32)
   */
  public async updateSensorData(sensorData: IrrigationStatus['sensorData']): Promise<void> {
    try {
      await this.database.ref(`${this.STATUS_PATH}/sensorData`).set(sensorData);
      await this.database.ref(`${this.STATUS_PATH}/lastUpdated`).set(new Date().toISOString());
    } catch (error) {
      console.error('Error updating sensor data:', error);
    }
  }

  /**
   * Check ESP32 connection status
   */
  public async checkESP32Connection(): Promise<boolean> {
    try {
      const snapshot = await this.database.ref(`${this.STATUS_PATH}/esp32Connected`).once('value');
      return snapshot.val() || false;
    } catch (error) {
      console.error('Error checking ESP32 connection:', error);
      return false;
    }
  }

  /**
   * Initialize irrigation system status
   */
  public async initializeSystem(): Promise<void> {
    try {
      const currentStatus = await this.getStatus();
      
      if (!currentStatus) {
        const initialStatus: IrrigationStatus = {
          isOn: false,
          lastUpdated: new Date().toISOString(),
          duration: 0,
          autoShutoff: true,
          esp32Connected: false,
        };

        await this.database.ref(`${this.STATUS_PATH}`).set(initialStatus);
        console.log('🔧 Irrigation system initialized');
      }
    } catch (error) {
      console.error('Error initializing irrigation system:', error);
    }
  }
}

export default IrrigationService.getInstance();