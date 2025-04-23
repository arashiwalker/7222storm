const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();

app.use(express.static('public'));
app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
  console.log('MirthaNode: Creating Stripe Checkout session...');
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: 'Donation to 72/22 Clock' },
          unit_amount: req.body.amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${req.headers.origin}/success.html`,
      cancel_url: `${req.headers.origin}/cancel.html`,
    });
    res.json({ id: session.id });
  } catch (error) {
    console.log('MirthaNode: Stripe error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Fallback route to serve index.html for unmatched routes
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));