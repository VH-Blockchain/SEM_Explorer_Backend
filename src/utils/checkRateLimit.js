import rateLimit from 'express-rate-limit';

const Limiter = rateLimit({
    windowMs: 24*60*60 * 1000, 
    max: 1, 
    message: 'Too many requests from this IP, we only send 0.1 B4Fire every 24 hours. Please try again after 24 hours from your original request.'
  });

export default Limiter;