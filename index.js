const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mk63pzz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const jobsCollection = client.db("career-code-db").collection("jobs");
    const applicationCollection = client.db("career-code-db").collection("application")

    // jobs api
    app.get("/jobs", async (req, res) => {
      const email = req.query.email;
      const query = {}
      if(email){
        query.hr_email = email

      }
      const cursor = jobsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    

    app.get("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.findOne(query);
      res.send(result);
    });

    app.post("/jobs", async (req, res)=> {
      const newJobs = req.body;
      const result = await jobsCollection.insertOne(newJobs)
      res.send(result)
    })

    // job  application related  api
    app.get("/application", async (req, res)=>{
      const email = req.query.email;
      const query = {
        applicant: email
      }
      const result = await applicationCollection.find(query).toArray()

      // bad way to aggregate data 
      for (const application of result) {
        const jobId = application.jobId;
        const jobQuery = {_id: new ObjectId(jobId)}
        const job = await jobsCollection.findOne(jobQuery)
        application.company = job.company;
        application.title = job.title;
        application.company_logo = job.company_logo
      }
      res.send(result)
    })

    app.get("/application/job/:id", async (req, res)=>{
      const job_id = req.params.job_id;
      const query = {jobId : job_id}
      const result = await applicationCollection.find(query)
      res.send(result)
    } )

    app.post("/application", async (req,res)=>{
      const newApplication = req.body;
      console.log(newApplication);
      const result = await applicationCollection.insertOne(newApplication)
      res.send(result)
    })
    

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

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
