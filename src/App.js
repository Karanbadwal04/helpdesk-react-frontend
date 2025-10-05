// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import ProfileSettings from './components/ProfileSettings';
import TicketDetail from './components/TicketDetail';
import { AppBar, Toolbar, Typography, Button, Box, createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import './App.css';

// --- ADVANCED MODERN & VIBRANT THEME ---
const vibrantDarkTheme = createTheme({
    palette: {
        mode: 'dark',
        // Primary: A dynamic, energetic blue/cyan
        primary: {
            main: '#00bcd4', // Cyan A700 - vibrant blue
            light: '#4dd0e1', // Lighter cyan
            dark: '#00838f',  // Darker cyan
            contrastText: '#ffffff',
        },
        // Secondary: A complementary, eye-catching magenta/pink
        secondary: {
            main: '#e91e63', // Pink A400 - vibrant magenta
            light: '#f06292', // Lighter pink
            dark: '#c2185b',  // Darker pink
            contrastText: '#ffffff',
        },
        // Backgrounds: Deeper, more atmospheric dark tones with enhanced transparency
        background: {
            default: 'transparent',
            paper: 'rgba(18, 25, 38, 0.65)', // Dark blue-grey, slightly more opaque for better content visibility
        },
        // Text: Crisp white for primary, softer grey for secondary
        text: {
            primary: '#e0f2f7', // Slightly off-white for modernity
            secondary: '#a7d9f0', // Light blue-grey
        },
        // Custom colors for specific elements (e.g., status, borders)
        info: {
            main: '#29b6f6', // Light Blue
        },
        success: {
            main: '#66bb6a', // Green
        },
        warning: {
            main: '#ffca28', // Amber
        },
        error: {
            main: '#ef5350', // Red
        },
    },
    typography: {
        fontFamily: "'Inter', sans-serif", // Modern, clean sans-serif font
        h4: {
            fontWeight: 700, // Bolder for impact
            color: '#e0f2f7',
            letterSpacing: '0.02em', // Slightly increased letter spacing
        },
        h5: {
            fontWeight: 600,
            color: '#00bcd4', // Primary color for sub-headings
        },
        h6: {
            fontWeight: 500,
            color: '#a7d9f0',
        },
        body1: {
            fontSize: '1rem',
            lineHeight: 1.6,
            color: '#e0f2f7',
        },
        body2: {
            fontSize: '0.875rem',
            lineHeight: 1.5,
            color: '#a7d9f0',
        },
        button: {
            fontWeight: 700,
        }
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    backdropFilter: 'blur(16px) saturate(180%)', // Stronger, crisper blur
                    border: '1px solid rgba(0, 188, 212, 0.25)', // Primary color border with transparency
                    borderRadius: '12px', // Slightly more rounded corners
                    transition: 'box-shadow 0.3s ease-in-out, border 0.3s ease-in-out',
                    '&:hover': {
                        boxShadow: '0 8px 32px 0 rgba(0, 188, 212, 0.15)', // Subtle glow on hover
                    }
                }
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10, // More rounded, modern button shape
                    textTransform: 'none',
                    fontWeight: 'bold',
                    padding: '8px 20px',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-2px)', // Subtle lift on hover
                        boxShadow: '0 4px 12px rgba(0, 188, 212, 0.4)', // Primary glow
                    },
                },
                containedPrimary: {
                    background: 'linear-gradient(45deg, #00bcd4 30%, #4dd0e1 90%)', // Gradient for primary button
                    '&:hover': {
                        background: 'linear-gradient(45deg, #4dd0e1 30%, #00bcd4 90%)',
                    }
                },
                containedSecondary: {
                    background: 'linear-gradient(45deg, #e91e63 30%, #f06292 90%)', // Gradient for secondary button
                    '&:hover': {
                        background: 'linear-gradient(45deg, #f06292 30%, #e91e63 90%)',
                    }
                },
                outlinedPrimary: {
                    borderColor: '#00bcd4',
                    color: '#00bcd4',
                    '&:hover': {
                        backgroundColor: 'rgba(0, 188, 212, 0.1)',
                        borderColor: '#00bcd4',
                    }
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 10, // Match button roundedness
                        '& fieldset': {
                            borderColor: 'rgba(0, 188, 212, 0.3)', // Primary color with transparency
                            transition: 'border-color 0.3s ease-in-out',
                        },
                        '&:hover fieldset': {
                            borderColor: '#4dd0e1', // Lighter primary on hover
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#00bcd4', // Full primary on focus
                            borderWidth: '2px', // Slightly thicker border on focus
                        },
                        color: '#e0f2f7',
                        backgroundColor: 'rgba(0, 0, 0, 0.2)', // Slight dark fill for fields
                    },
                    '& .MuiInputLabel-root': {
                        color: '#a7d9f0',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                        color: '#00bcd4',
                    },
                },
            },
        },
        MuiSelect: {
            styleOverrides: {
                icon: {
                    color: '#e0f2f7', // Icon color
                },
                root: {
                    color: '#e0f2f7', // Selected text color
                    borderRadius: 10,
                    '& .MuiOutlinedInput-notchedOutline': { // For consistency with TextField
                        borderColor: 'rgba(0, 188, 212, 0.3)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#4dd0e1',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#00bcd4',
                        borderWidth: '2px',
                    },
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                }
            }
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    color: '#e0f2f7',
                    backgroundColor: 'rgba(18, 25, 38, 0.8)', // Darker background for menu items
                    '&:hover': {
                        backgroundColor: 'rgba(0, 188, 212, 0.2)', // Light hover from primary
                    },
                    '&.Mui-selected': {
                        backgroundColor: 'rgba(0, 188, 212, 0.3)', // Selected item highlight
                        fontWeight: 'bold',
                        color: '#ffffff',
                    }
                },
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    color: '#a7d9f0',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: 'rgba(18, 25, 38, 0.7)', // Slightly more opaque for app bar
                    backdropFilter: 'blur(20px) saturate(150%)', // More pronounced blur
                    borderBottom: '1px solid rgba(0, 188, 212, 0.2)', // Subtle primary border
                    boxShadow: '0 4px 20px rgba(0, 188, 212, 0.1)', // Soft glow
                },
            },
        },
        MuiPaginationItem: { // Styling for pagination buttons
            styleOverrides: {
                root: {
                    color: '#e0f2f7',
                    '&.Mui-selected': {
                        backgroundColor: '#00bcd4',
                        color: '#ffffff',
                        '&:hover': {
                            backgroundColor: '#4dd0e1',
                        }
                    },
                    '&:hover': {
                        backgroundColor: 'rgba(0, 188, 212, 0.2)',
                    },
                }
            }
        },
        MuiAlert: { // Styling for alert messages
            styleOverrides: {
                root: {
                    borderRadius: '10px',
                    backdropFilter: 'blur(10px)',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Darker background for readability
                    color: '#e0f2f7',
                    '&.MuiAlert-standardError': {
                        border: '1px solid #ef5350',
                        color: '#ef5350',
                        '& .MuiAlert-icon': { color: '#ef5350' },
                    },
                    '&.MuiAlert-standardSuccess': {
                        border: '1px solid #66bb6a',
                        color: '#66bb6a',
                        '& .MuiAlert-icon': { color: '#66bb6a' },
                    },
                    '&.MuiAlert-standardInfo': {
                        border: '1px solid #29b6f6',
                        color: '#29b6f6',
                        '& .MuiAlert-icon': { color: '#29b6f6' },
                    },
                },
                message: {
                    fontWeight: 500,
                }
            }
        }
    },
});

function AppContent() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLoginSuccess = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        navigate('/');
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleUserUpdate = (updatedUserData) => {
        setUser(updatedUserData);
        localStorage.setItem('user', JSON.stringify(updatedUserData));
    };

    const handleDashboardClick = () => {
        if (user) {
            navigate('/');
        } else {
            navigate('/login');
        }
    };

    return (
        <Box className="App">
            <AppBar position="sticky">
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 }, fontWeight: 'bold' }}
                        onClick={handleDashboardClick}
                    >
                        HelpDesk Mini
                    </Typography>
                    <Box>
                        {user ? (
                            <>
                                <Button color="inherit" onClick={handleDashboardClick}>Dashboard</Button>
                                <Button color="inherit" component={Link} to="/profile">Profile</Button>
                                <Button color="inherit" onClick={handleLogout}>Logout</Button>
                            </>
                        ) : (
                            <>
                                <Button color="inherit" component={Link} to="/login">Login</Button>
                                <Button color="inherit" component={Link} to="/register">Register</Button>
                            </>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>

            <Box className="main-content">
                <Routes>
                    <Route path="/login" element={!user ? <Login onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/" />} />
                    <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
                    <Route path="/profile" element={user ? <ProfileSettings user={user} onUserUpdate={handleUserUpdate} /> : <Navigate to="/login" />} />
                    <Route path="/tickets/:id" element={user ? <TicketDetail user={user} /> : <Navigate to="/login" />} />
                    <Route path="/" element={
                        user ? (
                            user.role === 'admin' ? <AdminDashboard user={user} /> : <UserDashboard user={user} />
                        ) : (
                            <Navigate to="/login" />
                        )
                    }/>
                </Routes>
            </Box>
        </Box>
    );
}

function App() {
    return (
        <ThemeProvider theme={vibrantDarkTheme}> {/* Changed to vibrantDarkTheme */}
            <CssBaseline />
            <Router>
                <AppContent />
            </Router>
        </ThemeProvider>
    );
}

export default App;