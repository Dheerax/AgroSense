import firestore from '@react-native-firebase/firestore';
import { Farm, Crop, IoTDevice, SensorReading, IrrigationSystem } from '../types';

export class FarmService {
  // Create a new farm
  static async createFarm(userId: string, farmData: Omit<Farm, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; farm?: Farm; error?: string }> {
    try {
      const farm: Omit<Farm, 'id'> = {
        ...farmData,
        userId,
        crops: [],
        sensors: [],
        irrigationSystems: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const docRef = await firestore().collection('farms').add(farm);
      
      return { 
        success: true, 
        farm: { id: docRef.id, ...farm } 
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get user's farms
  static async getUserFarms(userId: string): Promise<Farm[]> {
    try {
      const snapshot = await firestore()
        .collection('farms')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Farm[];
    } catch (error) {
      console.error('Error fetching user farms:', error);
      return [];
    }
  }

  // Get farm by ID
  static async getFarmById(farmId: string): Promise<Farm | null> {
    try {
      const doc = await firestore().collection('farms').doc(farmId).get();
      if (!doc.exists) return null;
      
      return { id: doc.id, ...doc.data() } as Farm;
    } catch (error) {
      console.error('Error fetching farm:', error);
      return null;
    }
  }

  // Update farm
  static async updateFarm(farmId: string, updates: Partial<Farm>): Promise<{ success: boolean; error?: string }> {
    try {
      await firestore().collection('farms').doc(farmId).update({
        ...updates,
        updatedAt: new Date(),
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Add crop to farm
  static async addCrop(farmId: string, cropData: Omit<Crop, 'id' | 'farmId' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; crop?: Crop; error?: string }> {
    try {
      const crop: Omit<Crop, 'id'> = {
        ...cropData,
        farmId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const docRef = await firestore().collection('crops').add(crop);
      
      return { 
        success: true, 
        crop: { id: docRef.id, ...crop } 
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get farm crops
  static async getFarmCrops(farmId: string): Promise<Crop[]> {
    try {
      const snapshot = await firestore()
        .collection('crops')
        .where('farmId', '==', farmId)
        .orderBy('plantedDate', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Crop[];
    } catch (error) {
      console.error('Error fetching farm crops:', error);
      return [];
    }
  }

  // Update crop
  static async updateCrop(cropId: string, updates: Partial<Crop>): Promise<{ success: boolean; error?: string }> {
    try {
      await firestore().collection('crops').doc(cropId).update({
        ...updates,
        updatedAt: new Date(),
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Add IoT device to farm
  static async addIoTDevice(farmId: string, deviceData: Omit<IoTDevice, 'id' | 'farmId' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; device?: IoTDevice; error?: string }> {
    try {
      const device: Omit<IoTDevice, 'id'> = {
        ...deviceData,
        farmId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const docRef = await firestore().collection('devices').add(device);
      
      return { 
        success: true, 
        device: { id: docRef.id, ...device } 
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get farm IoT devices
  static async getFarmDevices(farmId: string): Promise<IoTDevice[]> {
    try {
      const snapshot = await firestore()
        .collection('devices')
        .where('farmId', '==', farmId)
        .orderBy('createdAt', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as IoTDevice[];
    } catch (error) {
      console.error('Error fetching farm devices:', error);
      return [];
    }
  }

  // Update device status
  static async updateDeviceStatus(deviceId: string, status: IoTDevice['status']): Promise<{ success: boolean; error?: string }> {
    try {
      await firestore().collection('devices').doc(deviceId).update({
        status,
        updatedAt: new Date(),
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Add sensor reading
  static async addSensorReading(deviceId: string, readingData: Omit<SensorReading, 'id' | 'deviceId'>): Promise<{ success: boolean; reading?: SensorReading; error?: string }> {
    try {
      const reading: Omit<SensorReading, 'id'> = {
        ...readingData,
        deviceId,
      };
      
      const docRef = await firestore().collection('sensor_readings').add(reading);
      
      // Update device's last reading
      await firestore().collection('devices').doc(deviceId).update({
        lastReading: { id: docRef.id, ...reading },
        updatedAt: new Date(),
      });
      
      return { 
        success: true, 
        reading: { id: docRef.id, ...reading } 
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get latest sensor readings
  static async getLatestSensorReadings(deviceId: string, limit: number = 10): Promise<SensorReading[]> {
    try {
      const snapshot = await firestore()
        .collection('sensor_readings')
        .where('deviceId', '==', deviceId)
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as SensorReading[];
    } catch (error) {
      console.error('Error fetching sensor readings:', error);
      return [];
    }
  }

  // Add irrigation system
  static async addIrrigationSystem(farmId: string, systemData: Omit<IrrigationSystem, 'id' | 'farmId' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; system?: IrrigationSystem; error?: string }> {
    try {
      const system: Omit<IrrigationSystem, 'id'> = {
        ...systemData,
        farmId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const docRef = await firestore().collection('irrigation_systems').add(system);
      
      return { 
        success: true, 
        system: { id: docRef.id, ...system } 
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get farm irrigation systems
  static async getFarmIrrigationSystems(farmId: string): Promise<IrrigationSystem[]> {
    try {
      const snapshot = await firestore()
        .collection('irrigation_systems')
        .where('farmId', '==', farmId)
        .orderBy('createdAt', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as IrrigationSystem[];
    } catch (error) {
      console.error('Error fetching irrigation systems:', error);
      return [];
    }
  }

  // Control irrigation system
  static async controlIrrigation(systemId: string, zoneId: string, action: 'start' | 'stop', duration?: number): Promise<{ success: boolean; error?: string }> {
    try {
      const updateData: any = {
        updatedAt: new Date(),
      };
      
      if (action === 'start') {
        updateData[`zones.${zoneId}.isActive`] = true;
        updateData[`zones.${zoneId}.lastActivated`] = new Date();
      } else {
        updateData[`zones.${zoneId}.isActive`] = false;
        updateData[`zones.${zoneId}.lastWatered`] = new Date();
      }
      
      await firestore().collection('irrigation_systems').doc(systemId).update(updateData);
      
      // Log irrigation activity
      await firestore().collection('irrigation_logs').add({
        systemId,
        zoneId,
        action,
        duration: duration || 0,
        timestamp: new Date(),
      });
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Delete farm
  static async deleteFarm(farmId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Delete related data first
      const batch = firestore().batch();
      
      // Delete crops
      const cropsSnapshot = await firestore().collection('crops').where('farmId', '==', farmId).get();
      cropsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      
      // Delete devices
      const devicesSnapshot = await firestore().collection('devices').where('farmId', '==', farmId).get();
      devicesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      
      // Delete irrigation systems
      const irrigationSnapshot = await firestore().collection('irrigation_systems').where('farmId', '==', farmId).get();
      irrigationSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      
      // Delete farm
      batch.delete(firestore().collection('farms').doc(farmId));
      
      await batch.commit();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
