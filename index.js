const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
require("dotenv").config();
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173"
    ],
    credentials: true,
  })
);

app.use(cookieParser());

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.ninjyyh.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    const UserCollection = client.db("Task").collection("Users");
    const MyTaskCollection = client.db("Task").collection("MyTask");

    app.post("/users", async (req, res) => {
      const User = req.body;
      console.log("auth user", User);
      const query = { email: User?.email };
      const Exitinguser = await UserCollection.findOne(query);
      if (Exitinguser) {
        console.log("user ase");
        return res.send({ message: "user already exist", insertedId: null });
      }
      const result = await UserCollection.insertOne(User);
      console.log(result);
      return res.send(result);
    });

    app.post("/CreateTask", async (req, res) => {
      const DonationRequest = req.body;
      console.log(DonationRequest, "arman");

      const result = await MyTaskCollection.insertOne(DonationRequest);
      console.log(result);
      return res.send(result);
    });
    // app.get("/MyTask/:email", async (req, res) => {
    //   console.log('ajryhr');
    //   const Body = req.body;
    //   const email = req?.params?.email;
    //   console.log(email, "arman");
    //   let query = {
    //     requester_email: email,
    //   };
    //   console.log(Body);
  
    //   if (!!Body) {
    //     // If Body is true, include status in the query
    //     const status = req.body; // Adjust this based on your actual request structure
    //     query = {
    //       ...query,
    //       task_status: status,
    //     };
    //   }
    //     const result = await MyTaskCollection.find(query).toArray();

    //     console.log(",", result);
    //     res.send(result);
    
    // });


    app.get("/MyTask/:email",  async (req, res) => {
    
      const email = req?.params?.email;
      console.log(email, "arman");

        const query = {
          requester_email: email,
        };
        const result = await MyTaskCollection.find(query).toArray();

        console.log(",", result);
        res.send(result);
      
    });
    
    app.get("/Update/:id", async (req, res) => {
      const id = req.params.id;
      console.log("id", id);
      const query = {
        _id: new ObjectId(id),
      };
      const result = await MyTaskCollection.findOne(query);
      console.log(result);
      res.send(result);
    });

    app.put("/UpdateTask/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedTask = req.body;
      console.log(updatedTask);

      const Task = {
        $set: {
          ProjectName: updatedTask.ProjectName,
          Category: updatedTask.Category,
          Document: updatedTask.Document,
          Priority: updatedTask.Priority,
          Task_start_date: updatedTask.Task_start_date,
          Task_End_Date: updatedTask.Task_End_Date,
          requester_email: updatedTask.requester_email,
          requester_photo: updatedTask.requester_photo,
          requester_Name: updatedTask.requester_Name,
          Task_status: updatedTask.Task_status,
        },
      };
      const result = await MyTaskCollection.updateOne(
        filter,
        Task,
        options
      );
      console.log(result);
      res.send(result);
    });


    app.delete("/MyTask/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await MyTaskCollection.deleteOne(query);
      res.send(result);
    });

    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Job task SERVICE SERVER IS RUNNING");
});

app.listen(port, () => {
  console.log(`Service server is running on ${port}`);
});