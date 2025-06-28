import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
  onAuthStateChanged
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyD4uTaThCVlUAVlAGvM9OpJZeOHm1MD8dA",
  authDomain: "fulltowin-6953b.firebaseapp.com",
  projectId: "fulltowin-6953b",
  storageBucket: "fulltowin-6953b.appspot.com",
  messagingSenderId: "333823762810",
  appId: "1:333823762810:web:your-app-id-here"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const setUpRecaptcha = (elementId) => {
  window.recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
    'size': 'invisible',
    'callback': (response) => {
      // reCAPTCHA solved, allow signInWithPhoneNumber.
      console.log('reCAPTCHA verified');
    },
    'expired-callback': () => {
      // Response expired. Ask user to solve reCAPTCHA again.
      console.log('reCAPTCHA expired');
    }
  });
};

export const sendVerificationCode = async (phoneNumber) => {
  try {
    const appVerifier = window.recaptchaVerifier;
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    window.confirmationResult = confirmationResult;
    return { success: true, message: 'Verification code sent successfully' };
  } catch (error) {
    console.error('Error sending verification code:', error);
    return { success: false, message: error.message };
  }
};

export const verifyCode = async (code) => {
  try {
    const confirmationResult = window.confirmationResult;
    const result = await confirmationResult.confirm(code);
    const user = result.user;
    return { success: true, user };
  } catch (error) {
    console.error('Error verifying code:', error);
    return { success: false, message: 'Invalid verification code' };
  }
};

// Auth state observer
export const onAuthStateChangedListener = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export default app;
