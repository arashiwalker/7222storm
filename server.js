const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();

// Middleware
app.use(cors({
    origin: 'https://morning-everglades-53594-d80c2e04b3e6.herokuapp.com',
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use(express.static('.'));

// Log server start
console.log('MirthaNode: STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'Loaded' : 'Not loaded');

// Stripe Checkout Session Endpoint
app.post('/create-checkout-session', async (req, res) => {
    console.log('MirthaNode: Received request to /create-checkout-session');
    console.log('MirthaNode: Request body:', req.body);
    try {
        console.log('MirthaNode: Creating Stripe Checkout session with amount:', req.body.amount);
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: { name: 'Donation' },
                    unit_amount: req.body.amount || 500 // Default $5
                },
                quantity: 1
            }],
            mode: 'payment',
            success_url: 'https://morning-everglades-53594-d80c2e04b3e6.herokuapp.com/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'https://morning-everglades-53594-d80c2e04b3e6.herokuapp.com/cancel',
            expires_at: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // Expire in 24 hours
        });
        console.log('MirthaNode: Session created:', session.id, 'Expires at:', new Date(session.expires_at * 1000));
        console.log('MirthaNode: Full session details:', JSON.stringify(session, null, 2));
        res.status(200).json({ id: session.id });
    } catch (error) {
        console.error('MirthaNode: Stripe error:', error.message, error.stack);
        console.error('MirthaNode: Stripe error details:', JSON.stringify(error, null, 2));
        res.status(500).json({ error: error.message });
    }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`MirthaNode: Server running on port ${PORT}`);
    console.log('MirthaNode: Environment PORT:', process.env.PORT || 'Not set, using default 3000');
});