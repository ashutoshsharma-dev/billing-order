import { useEffect } from "react";
import getCurrneycode from "@ashutoshdev/convert-currencycode-to-symbol";
import { useFetcher, useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
  IndexTable,
  LegacyCard,
  useIndexResourceState,
  Badge,
  Icon,
  DataTable,
  useBreakpoints,
} from "@shopify/polaris";
import { PageAddIcon } from "@shopify/polaris-icons";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import jsPDF from "jspdf";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const reponse = await admin.graphql(`
    query {
      orders(first: 10) {   
        nodes {
          id
          name
          createdAt
          totalPrice
          customer{
            firstName
            lastName
            email
          }
          currencyCode
          shippingAddress{
            address1
            city
            country
            zip
          }
          lineItems(first: 20) {
            nodes {
              currentQuantity
              title
              variant {
                id
                price
                displayName

              } 
            }
          }
          paymentGatewayNames
          shippingLine {
            id
            title
          }
          displayFinancialStatus
          displayFulfillmentStatus
        }
      }
    }
  `);
  const { data } = await reponse.json();
  
  const shopResponse = await admin.graphql(`
    query {
      shop {
        name
        email
        url
        billingAddress {
          country
        }
      }
    }
  `);

  // Parse shop data
  const { data: shopData } = await shopResponse.json();

  return {
    orders: data?.orders?.nodes ?? [],
    shop: shopData?.shop ?? {},
  };
};

export default function Index() {
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const { orders } = useLoaderData() || [];
  console.log("orders=>", orders);
  const resourceName = {
    singular: "order",
    plural: "orders",
  };

  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(orders);
  const getBadgeStatus = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "paid";
      case "unfulfilled":
        return "unfulfilled";
      case "fulfilled":
        return "fullfilled";
      case "pending":
        return "pending";
      case "cancelled":
        return "critical";
      case "refunded":
        return "refunded";
      default:
        return "pending";
    }
  };

  // functions to generate slips
  const genreateInvoice = (orderId) => {
    console.log("orderId=>", orderId);
    const order = orders.find((order) => order.id === orderId);
    const calculateSummary = (order) => {
      const subtotal = order.lineItems.nodes.reduce(
        (acc, item) => acc + parseFloat(item.variant.price),
        0,
      );
      const shipping = parseFloat(order.shippingLine?.price || 0);
      const total = subtotal + shipping;
      const totalPaid = parseFloat(order.totalPrice);

      return {
        subtotal: subtotal.toFixed(2),
        shipping: shipping.toFixed(2),
        total: total.toFixed(2),
        totalPaid: totalPaid.toFixed(2),
        currency: order.currencyCode,
      };
    };
    const { subtotal, shipping, total, totalPaid, currency } =
      calculateSummary(order);

    // const printWindow = window.open("", "", "width=800,height=600");
    const printWindow = window.open("", "_blank");
    const date = new Date().toLocaleDateString();
    // Invoice HTML content
    const htmlContent = `
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
  `;

    // Write the HTML content to the new window
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Trigger the print dialog
    printWindow.print();
  };
  const generateDraftOrder = (orderId) => {
    console.log("orderId=>", orderId);
    const order = orders.find((order) => order.id === orderId);
    const calculateSummary = (order) => {
      const subtotal = order.lineItems.nodes.reduce(
        (acc, item) => acc + parseFloat(item.variant.price),
        0,
      );
      const shipping = parseFloat(order.shippingLine?.price || 0);
      const total = subtotal + shipping;
      const totalPaid = parseFloat(order.totalPrice);

      return {
        subtotal: subtotal.toFixed(2),
        shipping: shipping.toFixed(2),
        total: total.toFixed(2),
        totalPaid: totalPaid.toFixed(2),
        currency: order.currencyCode,
      };
    };
    const { subtotal, shipping, total, totalPaid, currency } =
      calculateSummary(order);

    // const printWindow = window.open("", "", "width=800,height=600");
    const printWindow = window.open("", "_blank");
    const date = new Date().toLocaleDateString();
    // Invoice HTML content
    const htmlContent = `
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
          <h1>DRAFT ORDER</h1>
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
        <p><strong>Thank you for shopping with us!</strong></p>
      </body>
    </html>
  `;

    // Write the HTML content to the new window
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Trigger the print dialog
    printWindow.print();
  };

  const generateReturnForm = (orderId) => {
    const order = orders.find((order) => order.id === orderId);
    const calculateSummary = (order) => {
      const subtotal = order.lineItems.nodes.reduce(
        (acc, item) => acc + parseFloat(item.variant.price),
        0,
      );
      const shipping = parseFloat(order.shippingLine?.price || 0);
      const total = subtotal + shipping;
      const totalPaid = parseFloat(order.totalPrice);

      return {
        subtotal: subtotal.toFixed(2),
        shipping: shipping.toFixed(2),
        total: total.toFixed(2),
        totalPaid: totalPaid.toFixed(2),
        currency: order.currencyCode,
      };
    };
    const { subtotal, shipping, total, totalPaid, currency } =
      calculateSummary(order);

    // const printWindow = window.open("", "", "width=800,height=600");
    const printWindow = window.open("", "_blank");
    const date = new Date().toLocaleDateString();

    const htmlContent = `
    
    <!DOCTYPE html>
    <html>
      <head>
        <title>Return Form</title>
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

          <p><strong>Powered By Billinguo</strong></p>
        </div>
      
        <div class="detail-div">
          <div class="details">
            <p><strong>RETURN TO</strong></p>
            <p><strong>AshutoshDev</strong> </p>
            <p><strong>India</strong> </p>
          </div>
          <div class="details">
            <p><strong>Customer</strong></p>
            <p><strong>Customer:</strong> ${(order?.customer && `${order.customer.firstName ?? ""} ${order.customer.lastName ?? ""}`) || "Anonymous"}</p>
            <p><strong>Address:</strong> ${order?.shippingAddress?.address1 ?? "N/A"}</p>
            <p><strong>City:</strong> ${order?.shippingAddress?.city ?? "N/A"}</p>
            <p><strong>Zip:</strong> ${order?.shippingAddress?.zip ?? "N/A"}</p>
            <p><strong>Country:</strong> ${order?.shippingAddress?.country ?? "N/A"}</p>
          </div>
          <div class="details">
            <p><strong>REASON CODES</strong></p>
            <p><strong>A  = Exchange Code</strong></p>
            <p><strong>B = Damaged/Faulty</strong></p>
            <p><strong>C = Not Required</strong></p>
            <p><strong>D = Not Ordered</strong></p>
            
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>REASON CODE</th>
              <th>COMMENT</th>
            </tr>
          </thead>
          <tbody>
            ${order?.lineItems?.nodes
              ?.map(
                (item, index) => `
                <tr>
                  
                  <td>${item?.title ?? "N/A"} (${item?.variant?.displayName ?? "N/A"})</td>
                  <td>___ of ${item?.currentQuantity ?? 0}</td>
                  <td></td>
                  <td></td>
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
        <p><strong>Please pack all items carefully and return to the address shown above.</strong></p>
      </body>
    </html>
  `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Trigger the print dialog
    printWindow.print();
  };
  return (
    <Page>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <BlockStack gap="500">
              <Text variant="headingLg" as="h6">
                Recent Orders
              </Text>
              <Card>
                <BlockStack gap="500">
                  <BlockStack gap="200">
                    <LegacyCard>
                      <IndexTable
                        resourceName={resourceName}
                        condensed={useBreakpoints().smDown}
                        itemCount={orders.length}
                        headings={[
                          { title: "Order No." },
                          { title: "Customer" },
                          { title: "Invoice" },
                          { title: "Packing Slip" },
                          { title: "Returns form" },
                          { title: "Draft orders" },
                          { title: "Refund Note" },
                          { title: "Total", alignment: "end" },
                          { title: "Financial  status" },
                          { title: "Fulfillment status" },
                        ]}
                        pagination={{
                          hasNext: true,
                          onNext: () => {},
                        }}
                      >
                        {/* {rowMarkup} */}
                        {orders &&
                          orders.length > 0 &&
                          orders.map((order) => (
                            <IndexTable.Row
                              id={order.id}
                              key={order.id}
                              position={order.id}
                            >
                              <IndexTable.Cell>
                                <strong>{order.name}</strong>
                              </IndexTable.Cell>
                              <IndexTable.Cell>
                                <strong>
                                  {" "}
                                  {order?.customer?.firstName ||
                                  order?.customer?.lastName
                                    ? `${order?.customer?.firstName || ""} ${order?.customer?.lastName || ""}`.trim()
                                    : "Anonymous"}
                                </strong>
                              </IndexTable.Cell>
                              <IndexTable.Cell>
                                <Button
                                  icon={PageAddIcon}
                                  onClick={() => genreateInvoice(order.id)}
                                ></Button>
                              </IndexTable.Cell>
                              <IndexTable.Cell>
                                <Button icon={PageAddIcon}></Button>
                              </IndexTable.Cell>
                              <IndexTable.Cell>
                                <Button
                                  icon={PageAddIcon}
                                  onClick={() => generateReturnForm(order.id)}
                                ></Button>
                              </IndexTable.Cell>
                              <IndexTable.Cell>
                                <Button
                                  icon={PageAddIcon}
                                  onClick={() => generateDraftOrder(order.id)}
                                ></Button>
                              </IndexTable.Cell>{" "}
                              <IndexTable.Cell>
                                <Button icon={PageAddIcon}></Button>
                              </IndexTable.Cell>
                              <IndexTable.Cell>
                                {getCurrneycode(order.currencyCode)}{" "}
                                {order.totalPrice}
                              </IndexTable.Cell>
                              <IndexTable.Cell>
                                <Badge>
                                  <strong>
                                    {getBadgeStatus(
                                      order.displayFinancialStatus,
                                    )}
                                  </strong>
                                </Badge>
                              </IndexTable.Cell>
                              <IndexTable.Cell>
                                <Badge>
                                  <strong>
                                    {getBadgeStatus(
                                      order.displayFulfillmentStatus,
                                    )}
                                  </strong>
                                </Badge>
                              </IndexTable.Cell>
                            </IndexTable.Row>
                          ))}
                      </IndexTable>
                    </LegacyCard>
                  </BlockStack>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
