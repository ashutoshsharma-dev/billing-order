const HTMLTemplate = {
  invoice: [
    `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
          
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            table, th, td {
              border: 1px solid #ddd;
            }
            th, td {
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f4f4f4;
            }
            .details {
              margin-bottom: 20px;
            }
            .detail-div{
              display: flex;
              justify-content: space-between;
            }
            .header {
              text-align: end;
              margin-bottom: 20px;
            }
            detail-section{
             border: none;
            }
          </style>
        </head>
        <body>
       
          <div class="header">
            <h1>Invoice</h1>
            <p><strong>Order ID:</strong> ${order.name}</p>
            <p><strong>${date}</strong> </p>
          </div>
          <hr>
          <table class="detail-section">
            <thead>
              <tr>
                <th>Customer Details</th>
                <th>Shipping Address</th>
                <th>Payment Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <p><strong>Customer:</strong> ${order.customer.firstName || "Anonymous"} ${order.customer.lastNam0e || ""}</p>
                  <p><strong>Email:</strong> ${order.customer.email}</p>
                  <p><strong>Mobile:</strong> ${order.customer.phone}</p>
                </td>
                <td> 
                  <p><strong>Address:</strong> ${order.shippingAddress.address1}</p>
                  <p><strong>City:</strong> ${order.shippingAddress.city}</p>
                  <p><strong>Zip:</strong> ${order.shippingAddress.zip}</p>
                  <p><strong>Country:</strong> ${order.shippingAddress.country}</p>           
                </td>
                <td>
                  <p><strong>Payment Method</strong></p>
                  <p> ${order.paymentGatewayNames || "Mannual"}</p>
                  <p><strong>Shipping Method</strong></p>
                  <p> ${order.shippingLine?.title || "Standard"}</p>
                </td>
              </tr>
            </tbody>
          </table>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              ${order.lineItems.nodes
                .map(
                  (item, index) => `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${item.title} (${item.variant.displayName})</td>
                      <td>${item.currentQuantity}</td>
                      <td>${item.variant.price} ${order.currencyCode}</td>
                    </tr>
                  `,
                )
                .join("")}
            </tbody>
          </table>
          <p style="text-align: center;">Thank you for your order!</p>
        </body>
      </html>
    `,
    `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
  
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          table, th, td {
            border: 1px solid #ddd;
          }
          th, td {
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f4f4f4;
          }
          .details {
            margin-bottom: 20px;
          }
          .detail-div {
            display: flex;
            justify-content: space-between;
          }
          .header {
            text-align: end;
            margin-bottom: 20px;
          }
          .payment-summary {
            text-align: end;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Invoice</h1>
          <p><strong>Order ID:</strong> ${order?.name ?? "N/A"}</p>
          <p><strong>${date ?? "N/A"}</strong></p>
        </div>
        <hr>
        <div class="detail-div">
          <div class="details">
            <p><strong>Customer Details</strong></p>
            <p><strong>Customer:</strong> ${(order?.customer && `${order.customer.firstName ?? ""} ${order.customer.lastName ?? ""}`) || "Anonymous"}</p>
            <p><strong>Email:</strong> ${order?.customer?.email ?? "N/A"}</p>
            <p><strong>Mobile:</strong> ${order?.customer?.phone ?? "N/A"}</p>
          </div>
          <div class="details">
            <p><strong>Shipping Address</strong></p>
            <p><strong>Address:</strong> ${order?.shippingAddress?.address1 ?? "N/A"}</p>
            <p><strong>City:</strong> ${order?.shippingAddress?.city ?? "N/A"}</p>
            <p><strong>Zip:</strong> ${order?.shippingAddress?.zip ?? "N/A"}</p>
            <p><strong>Country:</strong> ${order?.shippingAddress?.country ?? "N/A"}</p>
          </div>
          <div class="details">
            <p><strong>Payment Method</strong></p>
            <p>${order?.paymentGatewayNames ?? "Manual"}</p>
            <p><strong>Shipping Method</strong></p>
            <p>${order?.shippingLine?.title ?? "Standard"}</p>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Item Total</th>
            </tr>
          </thead>
          <tbody>
            ${order?.lineItems?.nodes
              ?.map(
                (item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item?.title ?? "N/A"} (${item?.variant?.displayName ?? "N/A"})</td>
                  <td>${item?.currentQuantity ?? 0}</td>
                  <td>${item?.variant?.price ?? "N/A"} ${order?.currencyCode ?? "USD"}</td>
                  <td>${((item?.variant?.price ?? 0) * (item?.currentQuantity ?? 0)).toFixed(2)} ${order?.currencyCode ?? "USD"}</td>
                </tr>
              `,
              )
              .join("")}
          </tbody>
        </table>
        <div class="payment-summary">
          <p><strong>Subtotal:</strong> ${currency ?? "USD"} ${subtotal ?? 0}</p>
          <p><strong>Shipping:</strong> ${currency ?? "USD"} ${shipping ?? 0}</p>
          <p><strong>Total:</strong> ${currency ?? "USD"} ${total ?? 0}</p>
          <p><strong>Total Paid:</strong> ${currency ?? "USD"} ${totalPaid ?? 0}</p>
        </div>
        <p>Thank you for shopping with us!</p>
      </body>
    </html>
  `,
  ],
  payslip: [
    `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
  
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          table, th, td {
            border: 1px solid #ddd;
          }
          th, td {
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f4f4f4;
          }
          .details {
            margin-bottom: 20px;
          }
          .detail-div {
            display: flex;
            justify-content: space-between;
          }
          .header {
            text-align: end;
            margin-bottom: 20px;
          }
          .payment-summary {
            text-align: end;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Invoice</h1>
          <p><strong>Order ID:</strong> ${order?.name ?? "N/A"}</p>
          <p><strong>${date ?? "N/A"}</strong></p>
        </div>
        <hr>
        <div class="detail-div">
          <div class="details">
            <p><strong>Customer Details</strong></p>
            <p><strong>Customer:</strong> ${(order?.customer && `${order.customer.firstName ?? ""} ${order.customer.lastName ?? ""}`) || "Anonymous"}</p>
            <p><strong>Email:</strong> ${order?.customer?.email ?? "N/A"}</p>
            <p><strong>Mobile:</strong> ${order?.customer?.phone ?? "N/A"}</p>
          </div>
          <div class="details">
            <p><strong>Shipping Address</strong></p>
            <p><strong>Address:</strong> ${order?.shippingAddress?.address1 ?? "N/A"}</p>
            <p><strong>City:</strong> ${order?.shippingAddress?.city ?? "N/A"}</p>
            <p><strong>Zip:</strong> ${order?.shippingAddress?.zip ?? "N/A"}</p>
            <p><strong>Country:</strong> ${order?.shippingAddress?.country ?? "N/A"}</p>
          </div>
          <div class="details">
            <p><strong>Payment Method</strong></p>
            <p>${order?.paymentGatewayNames ?? "Manual"}</p>
            <p><strong>Shipping Method</strong></p>
            <p>${order?.shippingLine?.title ?? "Standard"}</p>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Item Total</th>
            </tr>
          </thead>
          <tbody>
            ${order?.lineItems?.nodes
              ?.map(
                (item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item?.title ?? "N/A"} (${item?.variant?.displayName ?? "N/A"})</td>
                  <td>${item?.currentQuantity ?? 0}</td>
                  <td>${item?.variant?.price ?? "N/A"} ${order?.currencyCode ?? "USD"}</td>
                  <td>${((item?.variant?.price ?? 0) * (item?.currentQuantity ?? 0)).toFixed(2)} ${order?.currencyCode ?? "USD"}</td>
                </tr>
              `,
              )
              .join("")}
          </tbody>
        </table>
        <div class="payment-summary">
          <p><strong>Subtotal:</strong> ${currency ?? "USD"} ${subtotal ?? 0}</p>
          <p><strong>Shipping:</strong> ${currency ?? "USD"} ${shipping ?? 0}</p>
          <p><strong>Total:</strong> ${currency ?? "USD"} ${total ?? 0}</p>
          <p><strong>Total Paid:</strong> ${currency ?? "USD"} ${totalPaid ?? 0}</p>
        </div>
        <p>Thank you for shopping with us!</p>
      </body>
    </html>
  `,
  ],
};
