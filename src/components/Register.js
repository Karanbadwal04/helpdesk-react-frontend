// src/components/Register.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Alert, useTheme } from '@mui/material'; // Import Alert and useTheme
import { motion } from 'framer-motion';

function Register() {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' }); // For user feedback
    const navigate = useNavigate();
    const theme = useTheme(); // Initialize useTheme

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage({ type: '', text: '' }); // Clear previous messages
        try {
            const response = await fetch('http://localhost:3001/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, username, email, password }),
            });
            const data = await response.json();
            if (response.ok) {
                setMessage({ type: 'success', text: 'Registration successful! Please log in.' });
                setTimeout(() => navigate('/login'), 2000); // Redirect after a short delay
            } else {
                setMessage({ type: 'error', text: data.error || 'Registration failed.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error, please try again.' });
            console.error('Registration network error:', error);
        }
    };

    return (
        <motion.div
            style={{ margin: '80px auto 0 auto', maxWidth: '400px', width: '90%' }} // Consistent margin/width
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
        >
            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    padding: 4, // Increased padding
                    borderRadius: 3, // More rounded corners
                    backgroundColor: 'background.paper',
                }}
            >
                <Typography variant="h5" component="h2" sx={{ mb: 1, color: 'primary.light' }}>Register for HelpDesk</Typography>
                
                {message.text && (
                    <Alert severity={message.type} sx={{ width: '100%', mb: 1 }}>
                        {message.text}
                    </Alert>
                )}

                <TextField
                    fullWidth
                    variant="outlined"
                    label="Full Name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <TextField
                    fullWidth
                    variant="outlined"
                    label="Username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <TextField
                    fullWidth
                    variant="outlined"
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <TextField
                    fullWidth
                    variant="outlined"
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <Button fullWidth variant="contained" color="primary" type="submit" sx={{ mt: 1, height: '50px' }}>
                    Register
                </Button>
                <Typography variant="body2" sx={{ mt: 1 }}>
                    Already have an account? 
                    {/* THE FIX IS HERE: Use Link with sx prop or theme colors */}
                    <Link to="/login" style={{ color: theme.palette.primary.main }}>Login here</Link>
                </Typography>
            </Box>
        </motion.div>
    );
}

export default Register;