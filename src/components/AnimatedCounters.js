    import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';

// Reusable Counter Component
function Counter({ target, label, suffix = '' }) {
    const [count, setCount] = useState(0);
    const counterRef = useRef(null);

    useEffect(() => {
        let frameId;
        const startCount = 0;
        const duration = 2500; // Animation duration in ms
        let startTime = null;

        // Easing function for a "slow down" effect
        const easeOutExpo = t => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

        const animateCount = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);
            const easedPercentage = easeOutExpo(percentage);
            
            const currentCount = Math.floor(easedPercentage * (target - startCount) + startCount);
            
            setCount(currentCount);

            if (progress < duration) {
                frameId = requestAnimationFrame(animateCount);
            } else {
                setCount(target); // Ensure it ends exactly on the target
            }
        };

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                startTime = null; 
                frameId = requestAnimationFrame(animateCount);
                observer.disconnect(); // Animate only once per page load
            }
        }, { threshold: 0.1 });

        if (counterRef.current) {
            observer.observe(counterRef.current);
        }

        return () => {
            cancelAnimationFrame(frameId);
            if (observer && counterRef.current) {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                observer.unobserve(counterRef.current);
            }
        };
    }, [target]);

    return (
        <Box ref={counterRef} sx={{ textAlign: 'center', margin: { xs: '1rem', md: '0 2rem' }, minWidth: '120px' }}>
            <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.light' }}>
                {count.toLocaleString()}{suffix}
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', marginTop: '0.5rem' }}>
                {label}
            </Typography>
        </Box>
    );
}

// Main component to hold all counters
export default function AnimatedCounters() {
    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: { xs: '1rem', md: '2rem' },
            padding: { xs: '2rem 1rem', md: '4rem 1rem' },
            backgroundColor: 'rgba(18, 25, 38, 0.5)',
            borderRadius: '12px',
            marginTop: '4rem',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 188, 212, 0.2)'
        }}>
            <Counter target={100} label="Users" suffix="+" />
            <Counter target={500} label="Tickets" suffix="+" />
            <Counter target={400} label="Closed" suffix="+" />
            <Counter target={100} label="In Progress" suffix="+" />
            <Counter target={100} label="Completion Rate" suffix="%" />
        </Box>
    );
}

