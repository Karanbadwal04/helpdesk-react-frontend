import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, TextField, Typography, Paper, Select, MenuItem, FormControl, InputLabel, Pagination, CircularProgress, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
// MODIFIED: Removed Link as it requires a Router context
// import { Link } from 'react-router-dom';

function UserDashboard({ user }) {
    const [tickets, setTickets] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium'); // Default priority for new tickets

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' }); // For user feedback
    const ticketsPerPage = 5; // Pagination limit

    // Memoize fetch function to prevent unnecessary re-renders in useEffect
    const fetchUserTickets = useCallback(async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const queryParams = new URLSearchParams({
                limit: ticketsPerPage,
                offset: (currentPage - 1) * ticketsPerPage,
                userId: user.userId, // Pass user ID to the backend
                role: user.role,     // Pass user role to the backend for filtering
                status: 'all',       // User dashboard shows all their tickets
            });
            if (searchTerm) {
                queryParams.append('search', searchTerm);
            }

            // MODIFIED: Replaced environment variable with hardcoded URL
            const response = await fetch(`https://helpdesk-api-backend.onrender.com/api/tickets?${queryParams.toString()}`);
            const data = await response.json();
            if (response.ok) {
                // No client-side filtering needed here, backend handles it with userId and role
                setTickets(data.tickets);
                setTotalPages(Math.ceil(data.total / ticketsPerPage));
            } else {
                setMessage({ type: 'error', text: data.error || "Failed to fetch tickets" });
                setTickets([]);
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error fetching tickets. Please check your connection.' });
            console.error('Network error fetching tickets:', error);
            setTickets([]);
        } finally {
            setLoading(false);
        }
    }, [user, currentPage, searchTerm]); // MODIFIED: Removed ticketsPerPage from dependencies as it's a constant

    useEffect(() => {
        if (user) {
            fetchUserTickets();
        }
    }, [user, currentPage, searchTerm, fetchUserTickets]); // Dependencies for useEffect

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' }); // Clear previous messages
        try {
            // MODIFIED: Replaced environment variable with hardcoded URL
            const response = await fetch('https://helpdesk-api-backend.onrender.com/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description, created_by_user_id: user.userId, priority }),
            });
            const data = await response.json();
            if (response.ok) {
                setMessage({ type: 'success', text: data.message || 'Ticket created successfully!' });
                setTitle('');
                setDescription('');
                setPriority('medium');
                setCurrentPage(1); // Reset to first page to see new ticket
                fetchUserTickets();
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to create ticket.' });
            }
        } catch (error) {
            console.error('Network error while creating ticket:', error);
            setMessage({ type: 'error', text: 'Network error while creating ticket.' });
        }
    };

    const handleDeleteTicket = async (ticketId) => {
        if (window.confirm('Are you sure you want to delete this ticket? This cannot be undone.')) {
            setMessage({ type: '', text: '' });
            try {
                // MODIFIED: Replaced environment variable with hardcoded URL
                const response = await fetch(`https://helpdesk-api-backend.onrender.com/api/tickets/${ticketId}`, {
                    method: 'DELETE',
                });
                const data = await response.json();
                if (response.ok) {
                    setMessage({ type: 'success', text: data.message });
                    setCurrentPage(1); // Reset to first page
                    fetchUserTickets();
                } else {
                    setMessage({ type: 'error', text: data.error || 'Failed to delete ticket.' });
                }
            } catch (error) {
                console.error('Network error while deleting ticket:', error);
                setMessage({ type: 'error', text: 'Network error while deleting ticket.' });
            }
        }
    };

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page on new search
    };

    // This SLA color logic is now simplified as the backend provides 'sla_status'
    const getSLAColor = (slaStatus) => {
        if (slaStatus === 'breached') return 'error.main';
        if (slaStatus === 'due_soon') return 'warning.main';
        if (slaStatus === 'on_track') return 'success.main';
        return 'text.secondary'; // 'closed' or 'no_sla'
    };


    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ width: '90%', maxWidth: '1100px', margin: '0 auto' }}
        >
            <Typography variant="h4" component="h2" sx={{ my: 3 }}>User Dashboard</Typography>

            {message.text && (
                <Alert severity={message.type} sx={{ mb: 3 }}>
                    {message.text}
                </Alert>
            )}

            {/* Create Ticket Section */}
            <Box component={Paper} elevation={3} sx={{ p: 3, mb: 4, bgcolor: 'background.paper', textAlign: 'left' }}>
                <Typography variant="h5" component="h3" sx={{ mb: 2, color: 'primary.main' }}>Raise a New Ticket 📝</Typography>
                <Box
                    component="form"
                    onSubmit={handleCreateTicket}
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                >
                    <TextField
                        fullWidth
                        label="Ticket Title"
                        variant="outlined"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                    />
                    <TextField
                        fullWidth
                        label="Describe your issue in detail"
                        variant="outlined"
                        multiline
                        rows={4}
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        required
                    />
                    <FormControl fullWidth>
                        <InputLabel>Priority</InputLabel>
                        <Select
                            value={priority}
                            label="Priority"
                            onChange={(e) => setPriority(e.target.value)}
                        >
                            <MenuItem value="low">Low</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="high">High</MenuItem>
                        </Select>
                    </FormControl>
                    <Button variant="contained" color="primary" type="submit">Submit Ticket</Button>
                </Box>
            </Box>

            {/* Your Submitted Tickets Section */}
            <Box component={Paper} elevation={3} sx={{ p: 3, bgcolor: 'background.paper', textAlign: 'left' }}>
                <Typography variant="h5" component="h3" sx={{ mb: 2, color: 'primary.main' }}>Your Submitted Tickets</Typography>

                {/* Search Input */}
                <TextField
                    fullWidth
                    label="Search your tickets..."
                    variant="outlined"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    sx={{ mb: 3 }}
                />

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    tickets.length > 0 ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {tickets.map((ticket, index) => (
                                <motion.div
                                    key={ticket.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: 0.1 * index }}
                                >
                                    <Paper elevation={2} sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.05)' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                            <Box sx={{ textAlign: 'left', flexGrow: 1 }}>
                                                <Typography variant="h6">{ticket.title}</Typography>
                                                <Typography variant="body1" sx={{ my: 0.5, opacity: 0.8 }}>{ticket.description}</Typography>
                                                <Typography variant="body2" color="text.secondary">Status: {ticket.status} | Priority: {ticket.priority}</Typography>
                                                {ticket.due_date && (
                                                    <Typography variant="caption" sx={{ color: getSLAColor(ticket.sla_status), fontWeight: 'bold' }}>
                                                        Due: {new Date(ticket.due_date).toLocaleString()} ({ticket.sla_status.replace('_', ' ').toUpperCase()})
                                                    </Typography>
                                                )}
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 1, mt: { xs: 2, sm: 0 } }}>
                                                {/* MODIFIED: Replaced Link with a standard <a> tag */}
                                                <Button variant="outlined" component={Link} to={`/tickets/${ticket.id}`}>
                                                  View Details
                                                </Button>
                                                {/* Only allow deletion if ticket is open and user is the creator */}
                                                {(ticket.status === 'open' && user.userId === ticket.created_by_user_id) && (
                                                    <Button variant="contained" color="secondary" onClick={() => handleDeleteTicket(ticket.id)}>
                                                        Delete
                                                    </Button>
                                                )}
                                            </Box>
                                        </Box>
                                    </Paper>
                                </motion.div>
                            ))}
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                <Pagination
                                    count={totalPages}
                                    page={currentPage}
                                    onChange={handlePageChange}
                                    color="primary"
                                    showFirstButton
                                    showLastButton
                                />
                            </Box>
                        </Box>
                    ) : (
                        <Typography variant="body1">No tickets found for your search or filters.</Typography>
                    )
                )}
            </Box>
        </motion.div>
    );
}

export default UserDashboard;
