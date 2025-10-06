import React, { useState } from 'react';
// MODIFIED: Removed Link and useNavigate as they require a Router context
import { Box, Button, TextField, Typography, Alert, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

function Register() {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    // MODIFIED: Removed useNavigate hook
    const theme = useTheme();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage({ type: '', text: '' });
        try {
            // MODIFIED: Replaced the environment variable with the actual backend URL to fix "process is not defined" error.
            const response = await fetch(`https://helpdesk-api-backend.onrender.com/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, username, email, password }),
            });
            
            if (response.ok) {
                setMessage({ type: 'success', text: 'Registration successful! Please log in.' });
                // MODIFIED: Used window.location.href for redirection instead of navigate
                setTimeout(() => window.location.href = '/login', 2000);
            } else {
                const data = await response.json();
                setMessage({ type: 'error', text: data.error || 'Registration failed.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error, please try again.' });
            console.error('Registration network error:', error);
        }
    };

    return (
        <motion.div
            style={{ margin: '80px auto 0 auto', maxWidth: '400px', width: '90%' }}
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
                    padding: 4,
                    borderRadius: 3,
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
                    {/* MODIFIED: Replaced Link component with a standard <a> tag */}
                    <a href="/login" style={{ color: theme.palette.primary.main }}>Login here</a>
                </Typography>
            </Box>
        </motion.div>
    );
}

export default Register;

