const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

const SHOP = process.env.SHOP;
const TOKEN = process.env.SHOPIFY_TOKEN;

app.post("/create-order", async (req, res) => {

  try {

    const { salesRep, client, items } = req.body;

    const lineItems = items.map(item => ({
      variant_id: item.variant_id,
      quantity: item.quantity
    }));

    const orderPayload = {
      order: {
        line_items: lineItems,
        financial_status: "paid",
        note_attributes: [
          { name: "Sales Rep", value: salesRep },
          { name: "Client", value: client }
        ],
        tags: "Internal Order"
      }
    };

    const response = await fetch(
      `https://${SHOP}/admin/api/2024-01/orders.json`,
      {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": TOKEN,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(orderPayload)
      }
    );

    const data = await response.json();

    res.json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Order creation failed" });
  }

});

app.get("/", (req, res) => {
  res.send("Internal Order API running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server started"));