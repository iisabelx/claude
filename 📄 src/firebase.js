import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Firestore helper functions
export const firestoreService = {
  // Pets
  async addPet(petData) {
    try {
      const docRef = await addDoc(collection(db, 'pets'), {
        ...petData,
        createdAt: new Date().toISOString()
      });
      return { id: docRef.id, ...petData };
    } catch (error) {
      console.error('Erro ao adicionar pet:', error);
      throw error;
    }
  },

  async getPets() {
    try {
      const querySnapshot = await getDocs(collection(db, 'pets'));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Erro ao buscar pets:', error);
      throw error;
    }
  },

  async getPetsByOng(ongId) {
    try {
      const q = query(collection(db, 'pets'), where('ongId', '==', ongId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Erro ao buscar pets da ONG:', error);
      throw error;
    }
  },

  async updatePet(petId, petData) {
    try {
      const petRef = doc(db, 'pets', petId);
      await updateDoc(petRef, petData);
      return { id: petId, ...petData };
    } catch (error) {
      console.error('Erro ao atualizar pet:', error);
      throw error;
    }
  },

  async deletePet(petId) {
    try {
      await deleteDoc(doc(db, 'pets', petId));
    } catch (error) {
      console.error('Erro ao deletar pet:', error);
      throw error;
    }
  },

  // Adoptions
  async createAdoption(adoptionData) {
    try {
      const docRef = await addDoc(collection(db, 'adoptions'), {
        ...adoptionData,
        createdAt: new Date().toISOString(),
        status: 'pending'
      });
      return { id: docRef.id, ...adoptionData };
    } catch (error) {
      console.error('Erro ao criar adoção:', error);
      throw error;
    }
  },

  async getAdoptionsByUser(userId) {
    try {
      const q = query(collection(db, 'adoptions'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Erro ao buscar adoções:', error);
      throw error;
    }
  },

  // Users
  async createUser(userId, userData) {
    try {
      await addDoc(collection(db, 'users'), {
        id: userId,
        ...userData,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  }
};

// Auth helper functions
export const authService = {
  async register(email, password, userData) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await firestoreService.createUser(userCredential.user.uid, userData);
      return userCredential.user;
    } catch (error) {
      console.error('Erro ao registrar:', error);
      throw error;
    }
  },

  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  },

  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  }
};

// Storage helper functions
export const storageService = {
  async uploadPetImage(file, petId) {
    try {
      const storageRef = ref(storage, `pet-images/${petId}-${Date.now()}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      throw error;
    }
  }
};

export default app;
