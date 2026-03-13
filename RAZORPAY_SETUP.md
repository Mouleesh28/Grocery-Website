# Razorpay Payment Integration Guide

## Overview
Your Gayathiri Grocery Mart app now has **real-time Razorpay payment integration** for online orders.

## Features Implemented

### 1. **Real-Time Payment Processing**
- Razorpay Checkout integration for secure online payments
- Automatic order creation with payment tracking
- Payment verification using secure signatures

### 2. **Payment Workflow**
```
Customer Clicks "Place Order" 
  ↓
Selects "Razorpay" mode
    ↓
Backend creates Razorpay order
    ↓
Razorpay Checkout modal opens
    ↓
Customer completes payment
    ↓
Payment signature verified
    ↓
Order status updated to "Approved"
    ↓
Stock automatically reduced
```

### 3. **Payment Status Tracking**
- **Pending**: Initial order state
- **Completed**: Payment successful
- **Failed**: Payment declined
- **Cancelled**: Customer closed payment modal

## Setup Instructions

### Step 1: Get Razorpay API Keys
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up or log in
3. Navigate to **Settings → API Keys**
4. Copy your **Test Key ID** and **Test Secret**

### Step 2: Update Environment Variables
Add these to your `.env` file (create if doesn't exist):
```
RAZORPAY_KEY_ID=your_test_key_id_here
RAZORPAY_KEY_SECRET=your_test_secret_here
```

**Important:**
- Do not use shared/sample keys from documentation.
- Generate your own Test Key ID and Test Secret in your Razorpay account and use only those values.

### Step 3: Test the Payment Flow

1. **Cash on Delivery (COD)** - Works as before
2. **Razorpay** - New Razorpay integration
   - Add items to cart
   - Click "Place Order"
  - Select "💳 Razorpay"
   - Click "Place Order" button
   - Razorpay modal will open
   - Use test card: `4111 1111 1111 1111` (Visa)
   - Use any future expiry date and any CVV

### Step 4: Test Card Details
**Success Case:**
- Card: 4111111111111111
- Expiry: Any future date (e.g., 12/25)
- CVV: Any 3 digits (e.g., 123)

**Failed Payment:**
- Card: 4000000000000002
- This will decline the payment

## Backend Changes

### New API Endpoints

#### 1. **POST /api/orders/create-payment-order**
Creates a Razorpay order
```javascript
Request:
{
  customerId: "customer123",
  shopId: "shop123",
  products: [...],
  totalAmount: 500
}

Response:
{
  orderId: "mongoDB_order_id",
  razorpayOrderId: "order_1234567890",
  amount: 500,
  currency: "INR",
  keyId: "rzp_test_xxx"
}
```

#### 2. **POST /api/orders/verify-payment**
Verifies payment signature and updates order
```javascript
Request:
{
  razorpay_order_id: "order_1234567890",
  razorpay_payment_id: "pay_1234567890",
  razorpay_signature: "signature_hash",
  orderId: "mongoDB_order_id"
}

Response:
{
  paymentValid: true,
  message: "Payment verified successfully",
  order: {...}
}
```

#### 3. **POST /api/orders/payment-failed**
Handles failed payments and restores stock
```javascript
Request:
{
  orderId: "mongoDB_order_id"
}

Response:
{
  message: "Payment marked as failed",
  order: {...}
}
```

### Updated Order Model
```javascript
{
  customerId: String,
  shopId: String,
  products: Array,
  totalAmount: Number,
  paymentMode: String, // "online" or "cod"
  status: String, // "Pending", "Approved", etc.
  paymentStatus: String, // "pending", "completed", "failed", "cancelled"
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  timestamps: {...}
}
```

## Frontend Changes

### New Functions

#### 1. **initializeRazorpayPayment(totalAmount)**
- Creates payment order on backend
- Opens Razorpay checkout modal
- Handles payment flow

#### 2. **verifyPayment(paymentData, orderId)**
- Sends payment details to backend
- Verifies payment signature
- Updates local cart and UI

#### 3. **handlePaymentFailure(orderId)**
- Marks order as failed
- Restores stock to inventory
- Shows failure notification

### Updated placeOrder() Function
Now handles both COD and online payments:
- COD: Direct order creation
- Online: Razorpay checkout flow

## Security Features

✅ **Payment Signature Verification**
- HMAC-SHA256 signature validation
- Prevents unauthorized payment claims

✅ **Stock Management**
- Stock reduced on successful payment only
- Stock restored on payment failure
- No overselling possible

✅ **Order Status Tracking**
- Payment status separate from order status
- Full audit trail of payment attempts

## Error Handling

| Scenario | Action |
|----------|--------|
| Invalid amount | Returns 400 error |
| Product not found | Returns 404 error |
| Bad signature | Rejects payment |
| Payment failed | Cancels order, restores stock |
| Modal closed | Cancels order, restores stock |

## Production Deployment

### Before Going Live:

1. **Switch to Live Keys**
   - Get Live Key ID and Secret from Razorpay
   - Update `.env` with Live keys
   - Ensure `NODE_ENV=production`

2. **Test on Live Mode**
   - Use actual test cards
   - Verify payment confirmations
   - Check webhook handling

3. **Enable Webhooks** (Optional)
   - Set up webhook URL in Razorpay Dashboard
   - Handle payment.authorized events
   - Handle payment.failed events

4. **Compliance Checklist**
   - [ ] SSL certificate installed
   - [ ] PCI DSS compliance verified
   - [ ] Privacy policy updated
   - [ ] Terms updated with payment terms
   - [ ] Customer support process defined

## Troubleshooting

### Issue: Payment modal doesn't open
**Solution:** 
- Check browser console for errors
- Verify Razorpay script is loaded
- Check API keys are correct

### Issue: Payment verification fails
**Solution:**
- Verify signature is correct
- Check API secret is correct
- Ensure request body matches signature

### Issue: Stock not reducing
**Solution:**
- Check product IDs match
- Verify product exists in database
- Check order creation response

## Support

For issues:
1. Check Razorpay Dashboard for payment status
2. Review server logs for API errors
3. Check browser DevTools console for frontend errors
4. Visit [Razorpay Docs](https://razorpay.com/docs/) for more info

## Next Steps

- [ ] Set up payment webhooks for confirmations
- [ ] Implement email notifications on payment success
- [ ] Add payment receipt generation
- [ ] Implement refund functionality
- [ ] Add payment history in customer dashboard
