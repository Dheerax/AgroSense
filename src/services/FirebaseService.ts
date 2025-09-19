import firebase from '@react-native-firebase/app';
import database from '@react-native-firebase/database';

class FirebaseService {
  private static instance: FirebaseService;
  private isInitialized: boolean = false;

  private constructor() {
    // Initialize synchronously since React Native Firebase auto-initializes
    this.initializeFirebase();
  }

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  private initializeFirebase(): void {
    try {
      // React Native Firebase auto-initializes from google-services.json
      // We just need to check if it's ready
      console.log('🔥 Firebase auto-initialized from google-services.json');
      console.log('🔥 Project ID:', firebase.app().options.projectId);
      console.log('🔥 Database URL:', firebase.app().options.databaseURL);
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Firebase initialization error:', error);
      this.isInitialized = false;
    }
  }

  public getDatabase() {
    if (!this.isInitialized) {
      throw new Error('Firebase not initialized');
    }
    return database();
  }

  public isReady(): boolean {
    return this.isInitialized;
  }

  // Test Firebase connection
  public async testConnection(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        console.log('❌ Firebase not initialized');
        return false;
      }
      
      // Simple connection test - try to read/write a test value
      const testRef = database().ref('test/connection');
      await testRef.set({
        timestamp: Date.now(),
        status: 'connected'
      });
      
      console.log('🔥 Firebase connection test: ✅ Connected and writable');
      return true;
    } catch (error) {
      console.error('Firebase connection test failed:', error);
      return false;
    }
  }
}

export default FirebaseService.getInstance();