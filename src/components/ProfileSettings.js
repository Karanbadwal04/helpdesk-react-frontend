import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert } from '@mui/material';
import { motion } from 'framer-motion';
// MODIFIED: Removed useNavigate as it requires a Router context
// import { useNavigate } from 'react-router-dom';

function ProfileSettings({ user, onUserUpdate }) {
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  // const navigate = useNavigate(); // MODIFIED: Removed this line

  useEffect(() => {
    if (!user) {
      // MODIFIED: Replaced navigate() with standard browser redirect
      window.location.href = '/login'; // Redirect if no user is logged in
    } else {
      setName(user.name);
      setUsername(user.username);
      setEmail(user.email);
    }
  }, [user]); // MODIFIED: Removed navigate from dependencies

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage({ type: '', text: '' }); // Clear previous messages

    if (password && password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    const updatedFields = {};
    if (name !== user.name) updatedFields.name = name;
    if (username !== user.username) updatedFields.username = username;
    if (email !== user.email) updatedFields.email = email;
    if (password) updatedFields.password = password;

    if (Object.keys(updatedFields).length === 0) {
      setMessage({ type: 'info', text: 'No changes to save.' });
      return;
    }

    try {
      // MODIFIED: Corrected the API URL
      const response = await fetch(`https://helpdesk-api-backend.onrender.com/api/users/${user.userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Profile updated successfully!' });
        const updatedUser = { ...user };
        if (updatedFields.name) updatedUser.name = updatedFields.name;
        if (updatedFields.username) updatedUser.username = updatedFields.username;
        if (updatedFields.email) updatedUser.email = updatedFields.email;
        onUserUpdate(updatedUser);
        setPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile.' });
      }
    } catch (error) {
      console.error('Network error updating profile:', error);
      setMessage({ type: 'error', text: 'Network error, please try again.' });
    }
  };

  if (!user) {
    return null; // Or a loading spinner, or redirect is handled by useEffect
  }

  return (
    <motion.div
      style={{ margin: '0 auto', width: '90%', maxWidth: '600px' }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Typography variant="h4" component="h2" sx={{ my: 3 }}>Profile Settings</Typography>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <Box
        component={Paper}
        elevation={3}
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          textAlign: 'left'
        }}
      >
        <Typography variant="h5" component="h3" sx={{ mb: 1, color: 'primary.main' }}>
          Update Your Details
        </Typography>

        <TextField
          fullWidth
          label="Full Name"
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <TextField
          fullWidth
          label="Username"
          variant="outlined"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <TextField
          fullWidth
          label="Email"
          variant="outlined"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Typography variant="h6" sx={{ mt: 2, mb: 1, color: 'primary.main' }}>
          Change Password (Optional)
        </Typography>
        <TextField
          fullWidth
          label="New Password"
          variant="outlined"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          helperText="Leave blank if you don't want to change it"
        />
        <TextField
          fullWidth
          label="Confirm New Password"
          variant="outlined"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSubmit} 
          sx={{ mt: 2 }}
        >
          Save Changes
        </Button>
      </Box>
    </motion.div>
  );
}

export default ProfileSettings;
