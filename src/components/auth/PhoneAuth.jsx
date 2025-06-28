import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  CircularProgress,
  Alert,
  Container,
  Paper
} from '@mui/material';
import { 
  setUpRecaptcha, 
  sendVerificationCode, 
  verifyCode,
  onAuthStateChangedListener
} from '../../services/firebase';

const PhoneAuth = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('phone'); // 'phone', 'code', 'success'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Set up reCAPTCHA when component mounts
    setUpRecaptcha('recaptcha-container');

    // Clean up reCAPTCHA when component unmounts
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
    };
  }, []);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const formattedPhoneNumber = phoneNumber.startsWith('+') 
        ? phoneNumber 
        : `+91${phoneNumber}`; // Default to India code if not provided
      
      const result = await sendVerificationCode(formattedPhoneNumber);
      
      if (result.success) {
        setStep('code');
        setSuccess('Verification code sent to your phone!');
      } else {
        setError(result.message || 'Failed to send verification code');
      }
    } catch (err) {
      console.error('Error sending code:', err);
      setError('Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!code) {
      setError('Please enter the verification code');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const result = await verifyCode(code);
      
      if (result.success) {
        setStep('success');
        setSuccess('Phone number verified successfully!');
        // You can redirect the user or update the UI as needed
      } else {
        setError(result.message || 'Verification failed');
      }
    } catch (err) {
      console.error('Error verifying code:', err);
      setError('Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Phone Number Verification
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {step === 'phone' && (
          <Box component="form" onSubmit={handleSendCode}>
            <TextField
              label="Phone Number"
              variant="outlined"
              fullWidth
              margin="normal"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter phone number with country code"
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={loading || !phoneNumber}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Send Verification Code'}
            </Button>
          </Box>
        )}

        {step === 'code' && (
          <Box component="form" onSubmit={handleVerifyCode}>
            <TextField
              label="Verification Code"
              variant="outlined"
              fullWidth
              margin="normal"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter 6-digit code"
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={loading || !code}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Verify Code'}
            </Button>
            <Button
              fullWidth
              sx={{ mt: 1 }}
              onClick={() => setStep('phone')}
              disabled={loading}
            >
              Back
            </Button>
          </Box>
        )}

        {step === 'success' && (
          <Box textAlign="center">
            <Typography variant="h6" color="success.main" gutterBottom>
              Verification Successful!
            </Typography>
            <Typography paragraph>
              Your phone number has been verified successfully.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                // Redirect to dashboard or home page
                window.location.href = '/';
              }}
            >
              Continue to Dashboard
            </Button>
          </Box>
        )}

        {/* Invisible reCAPTCHA container */}
        <div id="recaptcha-container"></div>
      </Paper>
    </Container>
  );
};

export default PhoneAuth;
