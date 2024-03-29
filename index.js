const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// =================================================================

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fmvmv30.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // =======================All collection==========================================
    const userCollection = client.db("CISClub").collection("users");
    const programmingCardCollection = client
      .db("CISClub")
      .collection("programmingCard");
    // =================================================================

    // ----------------------User Related ApI------------------------------------------
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "User already exists", insertedId: null });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      // console.log(req.headers);
      const result = await userCollection.find().toArray();
      res.send(result);
    });
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      // checking the admin
      // if (email !== req.decoded.email) {
      //   return res.status(403).send({ message: "Forbidden access" });
      // }
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let admin = false;

      if (user) {
        admin = user?.role == "admin";
      }
      res.send({ admin });
    });
    // ====================card api=============================================

    app.get("/programmingCard", async (req, res) => {
      // console.log(req.headers);
      const result = await programmingCardCollection.find().toArray();
      res.send(result);
    });

    // =================================================================
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// =================================================================
app.get("/", (req, res) => {
  res.send("CIS CLUB server is running");
});

app.listen(port, () => {
  console.log(`CIS CLUB server is sitting on port ${port}`);
});
