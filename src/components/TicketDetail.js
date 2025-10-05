// src/components/TicketDetail.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Button, TextField, Select, MenuItem, FormControl, InputLabel, Alert, LinearProgress } from '@mui/material';
import { motion } from 'framer-motion';

function TicketDetail({ user }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [comments, setComments] = useState([]);
    const [actions, setActions] = useState([]); // For timeline
    const [replyContent, setReplyContent] = useState('');
    const [status, setStatus] = useState('');
    const [priority, setPriority] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [agents, setAgents] = useState([]); // For assigning tickets
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(true);

    const fetchTicketDetails = useCallback(async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const ticketRes = await fetch(`http://localhost:3001/api/tickets/${id}`);
            const ticketData = await ticketRes.json();
            if (!ticketRes.ok) throw new Error(ticketData.error || 'Failed to fetch ticket');
            setTicket(ticketData.ticket);
            setStatus(ticketData.ticket.status);
            setPriority(ticketData.ticket.priority);
            setAssignedTo(ticketData.ticket.assigned_to_user_id || ''); // Handle null

            const commentsRes = await fetch(`http://localhost:3001/api/tickets/${id}/comments`);
            const commentsData = await commentsRes.json();
            if (!commentsRes.ok) throw new Error(commentsData.error || 'Failed to fetch comments');
            setComments(commentsData.comments);

            const actionsRes = await fetch(`http://localhost:3001/api/tickets/actions/${id}`);
            const actionsData = await actionsRes.json();
            if (!actionsRes.ok) throw new Error(actionsData.error || 'Failed to fetch timeline');
            setActions(actionsData.actions);

            if (user?.role === 'admin' || user?.role === 'agent') {
                // Fetch only agents for assignment dropdown
                const agentsRes = await fetch('http://localhost:3001/api/users?role=agent');
                const allUsers = await agentsRes.json();
                setAgents(allUsers.users.filter(u => u.role === 'agent' || u.role === 'admin')); // Admins can also be assigned
            }

        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Error fetching ticket details.' });
            console.error("Error fetching ticket details:", error);
        } finally {
            setLoading(false);
        }
    }, [id, user]); // Dependencies for useCallback

    useEffect(() => {
        if (user && id) {
            fetchTicketDetails();
        } else {
            navigate('/login'); // Redirect if not logged in or no ticket ID
        }
    }, [user, id, navigate, fetchTicketDetails]); // Dependencies for useEffect

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!replyContent.trim()) {
            setMessage({ type: 'warning', text: 'Reply cannot be empty.' });
            return;
        }
        try {
            const response = await fetch(`http://localhost:3001/api/tickets/${id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: replyContent, user_id: user.userId }),
            });
            const data = await response.json();
            if (response.ok) {
                setReplyContent('');
                setMessage({ type: 'success', text: data.message || 'Comment added successfully!' });
                fetchTicketDetails(); // Refresh all data
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to add reply.' });
            }
        } catch (error) {
            console.error('Failed to add reply:', error);
            setMessage({ type: 'error', text: 'Network error adding reply.' });
        }
    };

    const handleUpdateTicket = async () => {
        setMessage({ type: '', text: '' });
        if (!ticket) return;

        const changes = {};
        if (status !== ticket.status) changes.status = status;
        if (priority !== ticket.priority) changes.priority = priority;
        // Ensure assignedTo is correctly passed as null if unassigned is selected ('')
        if ((assignedTo === '' ? null : assignedTo) !== (ticket.assigned_to_user_id || null)) {
            changes.assigned_to_user_id = assignedTo === '' ? null : assignedTo;
        }

        if (Object.keys(changes).length === 0) {
            setMessage({ type: 'info', text: 'No changes to save.' });
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/api/tickets/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...changes, current_version: ticket.version, user_id: user.userId }), // Pass current version for optimistic locking
            });
            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: data.message || 'Ticket updated successfully!' });
                fetchTicketDetails(); // Refresh to get new version and status
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to update ticket.' });
            }
        } catch (error) {
            console.error('Failed to update ticket:', error);
            setMessage({ type: 'error', text: 'Network error updating ticket.' });
        }
    };

    if (loading) {
        return (
            <Box sx={{ width: '90%', maxWidth: '1200px', margin: '0 auto', mt: 4 }}>
                <LinearProgress color="primary" />
                <Typography variant="h6" sx={{ mt: 2 }}>Loading ticket details...</Typography>
            </Box>
        );
    }

    if (!ticket) {
        return (
            <Box sx={{ width: '90%', maxWidth: '1200px', margin: '0 auto', mt: 4 }}>
                <Alert severity="error">Ticket not found or accessible.</Alert>
                <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>Go Back</Button>
            </Box>
        );
    }

    const isUserCreator = user && user.userId === ticket.created_by_user_id;
    const isAdminOrAgent = user && (user.role === 'admin' || user.role === 'agent');
    const isTicketClosed = ticket.status === 'closed';

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
            style={{ width: '90%', maxWidth: '1200px', margin: '0 auto', textAlign: 'left' }}
        >
            <Typography variant="h4" component="h2" sx={{ my: 3, color: 'white' }}>Ticket #{ticket.id}: {ticket.title}</Typography>

            {message.text && (
                <Alert severity={message.type} sx={{ mb: 2 }}>
                    {message.text}
                </Alert>
            )}

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3, mb: 4 }}>
                {/* Ticket Details & Update Section */}
                <Paper elevation={3} sx={{ p: 3, bgcolor: 'background.paper' }}>
                    <Typography variant="h5" component="h3" sx={{ mb: 2, color: 'primary.main' }}>Details</Typography>
                    <Typography variant="h6" gutterBottom>{ticket.title}</Typography>
                    <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>{ticket.description}</Typography>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            Creator: <strong>{ticket.creator_name}</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Status: <strong>{ticket.status}</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Priority: <strong>{ticket.priority}</strong>
                        </Typography>
                        {ticket.assigned_agent_name && (
                                <Typography variant="body2" color="text.secondary">
                                    Assigned To: <strong>{ticket.assigned_agent_name}</strong>
                                </Typography>
                        )}
                        <Typography variant="body2" color="text.secondary">
                            Created: {new Date(ticket.created_at).toLocaleString()}
                        </Typography>
                        {ticket.updated_at && (
                            <Typography variant="body2" color="text.secondary">
                                Last Updated: {new Date(ticket.updated_at).toLocaleString()}
                            </Typography>
                        )}
                        {ticket.due_date && (
                            <Typography variant="body2" color="text.secondary" sx={{ color: getSLAColor(ticket.sla_status), fontWeight: 'bold' }}>
                                Due Date: {new Date(ticket.due_date).toLocaleString()} ({ticket.sla_status.replace('_', ' ').toUpperCase()})
                            </Typography>
                        )}
                    </Box>

                    {(isAdminOrAgent || (isUserCreator && !isTicketClosed)) && ( // Creator can update if not closed
                        <Box sx={{ mt: 3, p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>Update Ticket</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {isAdminOrAgent && ( // Only admin/agent can change status/assignment
                                    <>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Status</InputLabel>
                                            <Select
                                                value={status}
                                                label="Status"
                                                onChange={(e) => setStatus(e.target.value)}
                                                disabled={isTicketClosed}
                                            >
                                                <MenuItem value="open">Open</MenuItem>
                                                <MenuItem value="in_progress">In Progress</MenuItem>
                                                <MenuItem value="closed">Closed</MenuItem>
                                            </Select>
                                        </FormControl>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Assigned To</InputLabel>
                                            <Select
                                                value={assignedTo}
                                                label="Assigned To"
                                                onChange={(e) => setAssignedTo(e.target.value)}
                                                disabled={isTicketClosed}
                                            >
                                                <MenuItem value="">Unassigned</MenuItem>
                                                {agents.map(agent => (
                                                    <MenuItem key={agent.id} value={agent.id}>{agent.name}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </>
                                )}
                                {/* Creator can change priority if not closed, and if it's their ticket */}
                                {(isUserCreator || isAdminOrAgent) && (
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Priority</InputLabel>
                                        <Select
                                            value={priority}
                                            label="Priority"
                                            onChange={(e) => setPriority(e.target.value)}
                                            disabled={isTicketClosed}
                                        >
                                            <MenuItem value="low">Low</MenuItem>
                                            <MenuItem value="medium">Medium</MenuItem>
                                            <MenuItem value="high">High</MenuItem>
                                        </Select>
                                    </FormControl>
                                )}
                                <Button variant="contained" color="primary" onClick={handleUpdateTicket} disabled={isTicketClosed}>
                                    Save Updates
                                </Button>
                            </Box>
                        </Box>
                    )}

                    {isTicketClosed && (
                        <Alert severity="info" sx={{ mt: 3 }}>
                            This ticket is closed. No further updates or replies can be made.
                        </Alert>
                    )}

                    {/* Comment Reply Section */}
                    <Box sx={{ mt: 4, borderTop: '1px solid rgba(255,255,255,0.1)', pt: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Add a Reply</Typography>
                        {!isTicketClosed ? (
                            <Box
                                component="form"
                                onSubmit={handleReplySubmit}
                                sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                            >
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Your Reply"
                                    variant="outlined"
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    disabled={isTicketClosed}
                                />
                                <Button variant="contained" color="primary" type="submit" disabled={isTicketClosed}>
                                    Submit Reply
                                </Button>
                            </Box>
                        ) : (
                                <Typography variant="body2" color="text.secondary">Ticket is closed.</Typography>
                        )}
                    </Box>
                </Paper>

                {/* Comments and Timeline Sections */}
                <Box>
                    <Paper elevation={3} sx={{ p: 3, bgcolor: 'background.paper', mb: 3 }}>
                        <Typography variant="h5" component="h3" sx={{ mb: 2, color: 'primary.main' }}>Comments</Typography>
                        {comments.length > 0 ? (
                            <Box sx={{ maxHeight: 300, overflowY: 'auto', p: 1 }}>
                                {comments.map(comment => (
                                    <Paper key={comment.id} sx={{ p: 1.5, mb: 1.5, bgcolor: 'rgba(255,255,255,0.05)' }}>
                                        <Typography variant="body2"><strong>{comment.author_name}:</strong> {comment.content}</Typography>
                                        <Typography variant="caption" color="text.secondary">{new Date(comment.created_at).toLocaleString()}</Typography>
                                    </Paper>
                                ))}
                            </Box>
                        ) : (
                            <Typography variant="body2" color="text.secondary">No comments yet.</Typography>
                        )}
                    </Paper>

                    <Paper elevation={3} sx={{ p: 3, bgcolor: 'background.paper' }}>
                        <Typography variant="h5" component="h3" sx={{ mb: 2, color: 'primary.main' }}>Timeline</Typography>
                        {actions.length > 0 ? (
                            <Box sx={{ maxHeight: 300, overflowY: 'auto', p: 1 }}>
                                {actions.map((action, index) => (
                                    <Paper key={action.id || index} sx={{ p: 1.5, mb: 1.5, bgcolor: 'rgba(255,255,255,0.05)' }}>
                                        <Typography variant="body2">
                                            <strong>{action.actor_name || 'System'}:</strong> {action.action.replace(/_/g, ' ')}
                                            {action.details ? `: ${action.details}` : ''}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">{new Date(action.created_at).toLocaleString()}</Typography>
                                    </Paper>
                                ))}
                            </Box>
                        ) : (
                            <Typography variant="body2" color="text.secondary">No actions logged yet.</Typography>
                        )}
                    </Paper>
                </Box>
            </Box>
        </motion.div>
    );
}

export default TicketDetail;