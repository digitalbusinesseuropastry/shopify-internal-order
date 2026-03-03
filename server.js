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
      variantId: `gid://shopify/ProductVariant/${item.variant_id}`,
      quantity: item.quantity
    }));

    const mutation = `
      mutation orderCreate($input: OrderInput!) {
        orderCreate(input: $input) {
          order {
            id
            name
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        lineItems: lineItems,
        noteAttributes: [
          { name: "Sales Rep", value: salesRep || "" },
          { name: "Client", value: client || "" }
        ],
        tags: ["Internal Order"],
        financialStatus: PAID
      }
    };

    const response = await fetch(
      `https://${SHOP}/admin/api/2026-01/graphql.json`,
      {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": TOKEN,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query: mutation,
          variables: variables
        })
      }
    );

    const data = await response.json();

    if (data.errors || data.data.orderCreate.userErrors.length > 0) {
      console.error(data);
      return res.status(400).json(data);
    }

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
