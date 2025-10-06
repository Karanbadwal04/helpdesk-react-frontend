import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, TextField, Typography, Alert, useTheme, Paper, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import AnimatedCounters from './AnimatedCounters';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';

// Helper component for the test accounts
function TestAccount({ role, email, password, onFill }) {
    return (
        <Paper elevation={2} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, bgcolor: 'rgba(255, 255, 255, 0.05)' }}>
            <Box textAlign="left">
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{role}</Typography>
                <Typography variant="body2" color="text.secondary">{email}</Typography>
                <Typography variant="body2" color="text.secondary">Password: {password}</Typography>
            </Box>
            <Button variant="outlined" startIcon={<ContentPasteIcon />} onClick={() => onFill(email, password)}>
                Fill
            </Button>
        </Paper>
    );
}


function Login({ onLoginSuccess }) {
    const [loginIdentifier, setLoginIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const theme = useTheme();

    const backendUrl = process.env.REACT_APP_API_BASE_URL;

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage({ type: '', text: '' });

        if (!backendUrl) {
            setMessage({ type: 'error', text: 'API URL is not configured. Please check environment variables.' });
            return;
        }

        try {
            const response = await fetch(`${backendUrl}/api/login`, {
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

    const handleFill = (email, pass) => {
        setLoginIdentifier(email);
        setPassword(pass);
    };

    return (
        <Box> 
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
                        <Link to="/register" style={{ color: theme.palette.secondary.main }}>Register here</Link>
                    </Typography>
                </Box>
            </motion.div>

            {/* Test Accounts Section */}
            <motion.div
                 style={{ margin: '40px auto 0 auto', maxWidth: '400px', width: '90%' }}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.5, delay: 0.1 }}
            >
                <Box sx={{ p: 2, backgroundColor: 'background.paper', borderRadius: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: 'primary.light' }}>Test Accounts</Typography>
                    <TestAccount 
                        role="ADMIN" 
                        email="admin@mail.com" 
                        password="admin123" 
                        onFill={handleFill} 
                    />
                    <TestAccount 
                        role="USER" 
                        email="test@gmail.com" 
                        password="test" 
                        onFill={handleFill} 
                    />
                </Box>
            </motion.div>
            
            <motion.div
                 style={{ margin: '40px auto 0 auto', maxWidth: '1100px', width: '90%' }}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.5, delay: 0.2 }}
            >
                <AnimatedCounters />
            </motion.div>
        </Box>
    );
}

export default Login;