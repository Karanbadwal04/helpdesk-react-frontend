import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Button, TextField, Typography, Paper, Select, MenuItem,
    FormControl, InputLabel, IconButton, Pagination, CircularProgress, Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

function AdminDashboard({ user }) {
    const [tickets, setTickets] = useState([]);
    const [allAgents, setAllAgents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');
    const [filterBreached, setFilterBreached] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const ticketsPerPage = 10;

    // MODIFIED: Use the correct environment variable name
    const backendUrl = process.env.REACT_APP_API_BASE_URL;

    const fetchAdminTickets = useCallback(async () => {
        if (!backendUrl) {
            setMessage({ type: 'error', text: 'Backend URL not configured.' });
            setLoading(false);
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const queryParams = new URLSearchParams({
                limit: ticketsPerPage,
                offset: (currentPage - 1) * ticketsPerPage,
                role: user.role,
                status: filterStatus,
                priority: filterPriority,
                breached: filterBreached,
            });
            if (searchTerm) {
                queryParams.append('search', searchTerm);
            }

            const response = await fetch(`${backendUrl}/api/tickets?${queryParams.toString()}`);
            const data = await response.json();

            if (response.ok) {
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
    }, [user, currentPage, searchTerm, filterStatus, filterPriority, filterBreached, backendUrl]);

    const fetchAgents = useCallback(async () => {
        if (!backendUrl) {
            console.error('Backend URL not configured for fetching agents.');
            return;
        }
        try {
            const response = await fetch(`${backendUrl}/api/users?role=agent`);
            const data = await response.json();
            if (response.ok) {
                const admins = await fetch(`${backendUrl}/api/users?role=admin`);
                const adminData = await admins.json();
                setAllAgents([...data.users, ...adminData.users]);
            }
        } catch (error) {
            console.error('Failed to fetch agents:', error);
        }
    }, [backendUrl]);

    useEffect(() => {
        if (user && user.role === 'admin') {
            fetchAdminTickets();
            fetchAgents();
        }
    }, [user, fetchAdminTickets, fetchAgents]);

    const handleUpdateTicket = async (ticketId, currentVersion, updates) => {
        if (!backendUrl) {
            setMessage({ type: 'error', text: 'Backend URL not configured for updating ticket.' });
            return;
        }
        setMessage({ type: '', text: '' });
        try {
            const response = await fetch(`${backendUrl}/api/tickets/${ticketId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...updates, current_version: currentVersion, user_id: user.userId }),
            });
            const data = await response.json();
            if (response.ok) {
                setMessage({ type: 'success', text: 'Ticket updated successfully!' });
                fetchAdminTickets();
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to update ticket.' });
            }
        } catch (error) {
            console.error('Failed to update ticket:', error);
            setMessage({ type: 'error', text: 'Network error updating ticket.' });
        }
    };

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleFilterStatusChange = (e) => {
        setFilterStatus(e.target.value);
        setCurrentPage(1);
    };

    const handleFilterPriorityChange = (e) => {
        setFilterPriority(e.target.value);
        setCurrentPage(1);
    };

    const handleFilterBreachedChange = (e) => {
        setFilterBreached(e.target.checked);
        setCurrentPage(1);
    };

    const getSLAColor = (slaStatus) => {
        if (slaStatus === 'breached') return 'error.main';
        if (slaStatus === 'due_soon') return 'warning.main';
        if (slaStatus === 'on_track') return 'success.main';
        return 'text.secondary';
    };

    const handleDeleteComment = async (commentId) => {
        if (!backendUrl) {
            setMessage({ type: 'error', text: 'Backend URL not configured for deleting comment.' });
            return;
        }
        if (!user || user.role !== 'admin') {
            setMessage({ type: 'error', text: 'You do not have permission to delete comments.' });
            return;
        }
        if (window.confirm('Are you sure you want to delete this comment?')) {
            setMessage({ type: '', text: '' });
            try {
                const response = await fetch(`${backendUrl}/api/comments/${commentId}?adminId=${user.userId}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    setMessage({ type: 'success', text: 'Comment deleted.' });
                    fetchAdminTickets();
                } else {
                    const data = await response.json();
                    setMessage({ type: 'error', text: `Failed to delete comment: ${data.error}` });
                }
            } catch (error) {
                console.error('Error deleting comment:', error);
                setMessage({ type: 'error', text: 'Network error deleting comment.' });
            }
        }
    };

    if (!user || user.role !== 'admin') {
        return (
            <Box sx={{ my: 4 }}>
                <Alert severity="error">Access Denied: You must be an administrator to view this page.</Alert>
            </Box>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ width: '90%', maxWidth: '1200px', margin: '0 auto' }}
        >
            <Typography variant="h4" component="h2" sx={{ my: 3 }}>Admin Dashboard</Typography>

            {message.text && (
                <Alert severity={message.type} sx={{ mb: 3 }}>
                    {message.text}
                </Alert>
            )}

            <Box component={Paper} elevation={3} sx={{ p: 3, mb: 4, bgcolor: 'background.paper' }}>
                <Typography variant="h5" component="h3" sx={{ mb: 2, color: 'primary.main' }}>Ticket Overview</Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                    <TextField
                        label="Search tickets..."
                        variant="outlined"
                        size="small"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        sx={{ flexGrow: 1, minWidth: '200px' }}
                    />
                    <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Status</InputLabel>
                        <Select value={filterStatus} onChange={handleFilterStatusChange} label="Status">
                            <MenuItem value="all">All</MenuItem>
                            <MenuItem value="open">Open</MenuItem>
                            <MenuItem value="in_progress">In Progress</MenuItem>
                            <MenuItem value="closed">Closed</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Priority</InputLabel>
                        <Select value={filterPriority} onChange={handleFilterPriorityChange} label="Priority">
                            <MenuItem value="all">All</MenuItem>
                            <MenuItem value="low">Low</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="high">High</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl variant="outlined" size="small" sx={{ display: 'flex', alignItems: 'center', minWidth: 120 }}>
                        <label>
                            <input
                                type="checkbox"
                                checked={filterBreached}
                                onChange={handleFilterBreachedChange}
                            />
                            <Typography variant="body2" component="span" sx={{ml:1}}>Breached SLA</Typography>
                        </label>
                    </FormControl>
                </Box>

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
                                    transition={{ duration: 0.3, delay: 0.05 * index }}
                                >
                                    <Paper elevation={2} sx={{ p: 2, textAlign: 'left', bgcolor: 'rgba(255, 255, 255, 0.05)' }}>
                                        <Typography variant="h6">Ticket #{ticket.id}: {ticket.title}</Typography>
                                        <Typography variant="body2" sx={{ my: 0.5, opacity: 0.8 }}>{ticket.description}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Creator: <strong>{ticket.creator_name}</strong> | Created: {new Date(ticket.created_at).toLocaleDateString()}
                                        </Typography>
                                        {ticket.assigned_agent_name && (
                                            <Typography variant="body2" color="text.secondary">
                                                Assigned To: <strong>{ticket.assigned_agent_name}</strong>
                                            </Typography>
                                        )}
                                        {ticket.due_date && (
                                            <Typography variant="caption" sx={{ color: getSLAColor(ticket.sla_status), fontWeight: 'bold', display: 'block' }}>
                                                Due: {new Date(ticket.due_date).toLocaleString()} ({ticket.sla_status.replace('_', ' ').toUpperCase()})
                                            </Typography>
                                        )}

                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mt: 2 }}>
                                            <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                                                <InputLabel id={`status-label-${ticket.id}`}>Status</InputLabel>
                                                <Select
                                                    labelId={`status-label-${ticket.id}`}
                                                    value={ticket.status}
                                                    label="Status"
                                                    onChange={(e) => handleUpdateTicket(ticket.id, ticket.version, { status: e.target.value })}
                                                >
                                                    <MenuItem value="open">Open</MenuItem>
                                                    <MenuItem value="in_progress">In Progress</MenuItem>
                                                    <MenuItem value="closed">Closed</MenuItem>
                                                </Select>
                                            </FormControl>
                                            <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                                                <InputLabel id={`priority-label-${ticket.id}`}>Priority</InputLabel>
                                                <Select
                                                    labelId={`priority-label-${ticket.id}`}
                                                    value={ticket.priority}
                                                    label="Priority"
                                                    onChange={(e) => handleUpdateTicket(ticket.id, ticket.version, { priority: e.target.value })}
                                                >
                                                    <MenuItem value="low">Low</MenuItem>
                                                    <MenuItem value="medium">Medium</MenuItem>
                                                    <MenuItem value="high">High</MenuItem>
                                                </Select>
                                            </FormControl>
                                            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
                                                <InputLabel id={`assign-label-${ticket.id}`}>Assign To</InputLabel>
                                                <Select
                                                    labelId={`assign-label-${ticket.id}`}
                                                    value={ticket.assigned_to_user_id || ''}
                                                    label="Assign To"
                                                    onChange={(e) => handleUpdateTicket(ticket.id, ticket.version, { assigned_to_user_id: e.target.value })}
                                                >
                                                    <MenuItem value="">Unassigned</MenuItem>
                                                    {allAgents.map(agent => (
                                                        <MenuItem key={agent.id} value={agent.id}>{agent.name}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                            <Button variant="outlined" component={Link} to={`/tickets/${ticket.id}`}>
                                                View Details & Reply
                                            </Button>
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
                        <Typography variant="body1">No tickets found for the current filters.</Typography>
                    )
                )}
            </Box>
        </motion.div>
    );
}

export default AdminDashboard;

