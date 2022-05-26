const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6tpod.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const productCollection = client.db("manufacturer").collection("products");
    const bookingCollection = client.db("manufacturer").collection("booking");
    const userCollection = client.db("manufacturer").collection("users");

    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });

    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const token = jwt.sign(
        { email: email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" }
      );
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.send({ result, token });
    });

    app.get("/booking", async (req, res) => {
      const customer = req.query.customer;
      const query = { customer: customer };
      const bookings = await bookingCollection.find(query).toArray();
      res.send(bookings);
      /*       const token = req.headers.authorization;
      const decodedEmail = req.decoded.email; 
      if (patient === decodedEmail) {
        const query = { patient: patient };
        const bookings = await bookingCollection.find(query).toArray();
        return res.send(bookings);
      } else {
        return res.status(403).send({ message: "Forbidden access" });
      }*/
    });

    app.post("/booking", async (req, res) => {
      const booking = req.body;

      const result = await bookingCollection.insertOne(booking);
      res.send({ success: true, result });
    });
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello From Warehouse!");
});

app.listen(port, () => {
  console.log("Listening to port ", port);
});
