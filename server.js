const express = require('express');
const Stripe = require('stripe');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

console.log('MirthaNode: STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'Loaded' : 'Not loaded');

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors({ origin: 'http://localhost:8000' }));
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post('/create-checkout-session', async (req, res) => {
    console.log('MirthaNode: Received request to /create-checkout-session');
    try {
        const { amount } = req.body;
        console.log('MirthaNode: Creating session with amount:', amount);
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Donation to 72/22 Clock',
                        },
                        unit_amount: amount,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: 'http://localhost:8000/success.html',
            cancel_url: 'http://localhost:8000/index.html',
        });
        console.log('MirthaNode: Session created:', session.id);
        res.json({ id: session.id });
    } catch (error) {
        console.error('MirthaNode: Error creating checkout session:', error.message);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`MirthaNode: Server running on http://localhost:${PORT}`);
});