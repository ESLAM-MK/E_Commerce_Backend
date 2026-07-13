export const createPaymobPayment = async (orderData, userData) => {
    try {
        // first step creant auth token 
        const authResponse = await fetch(`${process.env.PAYMOB_IFRAME_BASE_URL}/auth/tokens`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ api_key: process.env.PAYMOB_API_KEY })
        })
        if (!authResponse.ok) {
            console.log("authentication failed")
        }
        const authData = await authResponse.json()
        const authToken = authData.token

        //second step send total price
        const priceIncent = Math.round(orderData.totalPrice * 100)
        console.log("Price Sent to Paymob" ,priceIncent)
        const orderResponse = await fetch(`${process.env.PAYMOB_IFRAME_BASE_URL}/ecommerce/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                auth_token: authToken,
                amount_cents: priceIncent,
                delivery_needed: false,
                currency: "EGP",
                items: []
            })
        })
        if (!orderResponse.ok) {
            console.log("failed to get order id")
        }
        const orderDa = await orderResponse.json()
        const paymobOrderId = orderDa.id
        // third step to get payment token
        const paymentResponse = await fetch(`${process.env.PAYMOB_IFRAME_BASE_URL}/acceptance/payment_keys`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                auth_token:authToken,
                amount_cents:priceIncent,
                expiration: 3600, // one hour for payment 
                order_id: paymobOrderId,
                currency: "EGP",
            integration_id: Number(process.env.PAYMOB_INTEGRATION_ID),
            lock_order_when_paid: "true",
            billing_data:{
                apartment: "NA",
                email: userData.email || "customer@example.com",
                floor: "NA",
                first_name: userData.name || "Customer",
                street: orderData.addressInfo?.street || "NA",
                building: "NA",
                phone_number: orderData.addressInfo?.phone || "01000000000",
                shipping_method: "PKG",
                postal_code: "NA",
                city: orderData.addressInfo?.city || "Cairo",
                country: "EGP",
                last_name: "User",
                state: "NA"
            }
            })
        })
        if(!paymentResponse.ok){
             console.log("failed to get payment token")
        }
        const paymentData = await paymentResponse.json()
        const paymentToken =paymentData.token
        const iframeUrl = `${process.env.PAYMOB_IFRAME_BASE_URL}/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentToken}`
        return {iframeUrl , paymobOrderId}
    } catch (error) {
        console.log("Paymob Integration Error:",error.message)
    }
}