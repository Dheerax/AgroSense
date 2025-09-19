import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { User } from '../types';

export class AuthService {
  // Register new user
  static async register(email: string, password: string, name: string, language: string = 'en') {
    try {
      const { user } = await auth().createUserWithEmailAndPassword(email, password);
      
      // Update display name
      await user.updateProfile({ displayName: name });
      
      // Create user document in Firestore
      const userData: Omit<User, 'id'> = {
        email: user.email!,
        name,
        language,
        location: {
          latitude: 0,
          longitude: 0,
          address: '',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await firestore().collection('users').doc(user.uid).set(userData);
      
      return { success: true, user: { id: user.uid, ...userData } };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Login user
  static async login(email: string, password: string) {
    try {
      const { user } = await auth().signInWithEmailAndPassword(email, password);
      
      // Get user data from Firestore
      const userDoc = await firestore().collection('users').doc(user.uid).get();
      const userData = userDoc.data() as Omit<User, 'id'>;
      
      return { success: true, user: { id: user.uid, ...userData } };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Logout user
  static async logout() {
    try {
      await auth().signOut();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get current user
  static getCurrentUser() {
    return auth().currentUser;
  }

  // Check auth state
  static onAuthStateChanged(callback: (user: any) => void) {
    return auth().onAuthStateChanged(callback);
  }

  // Update user profile
  static async updateProfile(userId: string, updates: Partial<User>) {
    try {
      await firestore().collection('users').doc(userId).update({
        ...updates,
        updatedAt: new Date(),
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Reset password
  static async resetPassword(email: string) {
    try {
      await auth().sendPasswordResetEmail(email);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Update location
  static async updateLocation(userId: string, location: User['location']) {
    try {
      await firestore().collection('users').doc(userId).update({
        location,
        updatedAt: new Date(),
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
