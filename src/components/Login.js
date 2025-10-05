// src/components/Login.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, TextField, Typography, Alert, useTheme } from '@mui/material'; // Import useTheme
import { motion } from 'framer-motion';

function Login({ onLoginSuccess }) {
    const [loginIdentifier, setLoginIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const theme = useTheme(); // Initialize useTheme

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage({ type: '', text: '' });
        try {
            const response = await fetch('http://localhost:3001/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ loginIdentifier, password }),
            });
            const data = await response.json();
            if (response.ok) {
                setMessage({ type: 'success', text: 'Login successful!' });
                onLoginSuccess(data);
            } else {
                setMessage({ type: 'error', text: data.error || 'Login failed: Invalid credentials.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error, please try again.' });
            console.error('Login network error:', error);
        }
    };

    return (
        <motion.div
            style={{ margin: '80px auto 0 auto', maxWidth: '400px', width: '90%' }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    padding: 4,
                    borderRadius: 3,
                    backgroundColor: 'background.paper',
                }}
            >
                <Typography variant="h5" component="h2" sx={{ mb: 1, color: 'primary.light' }}>Login to HelpDesk</Typography>
                
                {message.text && (
                    <Alert severity={message.type} sx={{ width: '100%', mb: 1 }}>
                        {message.text}
                    </Alert>
                )}

                <TextField
                    fullWidth
                    variant="outlined"
                    label="Email or Username"
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
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
                
                <Button fullWidth variant="contained" type="submit" sx={{ mt: 1, height: '50px' }}>
                    Login
                </Button>
                
                <Typography variant="body2" sx={{ mt: 1 }}>
                    Don't have an account? 
                    {/* THE FIX IS HERE: Use Link with sx prop or theme colors */}
                    <Link to="/register" style={{ color: theme.palette.secondary.main }}>Register here</Link>
                </Typography>
            </Box>
        </motion.div>
    );
}

export default Login;