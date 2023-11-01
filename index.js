const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
require("dotenv").config();


// Middlewire
app.use(express.json());
const corsConfig = {
    origin: '*',
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
}
app.use(cors(corsConfig))

const userName = process.env.USER_DB_NAME;
const userPass = process.env.USER_DB_PASS;


const uri = `mongodb+srv://${userName}:${userPass}@cluster0.t259fjj.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();

    const database = client.db("technology_electronic");
    const productsCollections = database.collection("products");
    const brandsCollections = database.collection("brands");
    const cartsCollections = database.collection("carts");
    const usersCollections = database.collection("users");


    // Get all product 
    app.get("/products", async (req, res) => {
        const result = await productsCollections.find().toArray();
        res.send(result);
    });
    
    // Get Single product with ID 
    app.get("/products/:id", async (req, res) => {
        const id = req.params.id;
        const filter = {_id : new ObjectId(id)};
        const result = await productsCollections.findOne(filter);
        res.send(result);
    });

    // crate new product
    app.post("/products", async (req, res) => {
        const product = req.body;
        const result = await productsCollections.insertOne(product);
        res.send(result);
    })

    // Update product with ID
    app.put("/products/:id", async (req, res) => {
        const id = req.params.id;
        const filter = {_id : new ObjectId(id)};
        const product = req.body;
        const options = { upsert: false };
        const updateProduct = {
            $set: product,
        }
        const result = await productsCollections.updateOne(filter, updateProduct, options)
        res.send(result);
    })

    // Delete Single product with ID 
    app.delete("/products/:id", async (req, res) => {
        const id = req.params.id;
        const filter = {_id : new ObjectId(id)};
        const result = await productsCollections.deleteOne(filter);
        res.send(result);
    });

    // Get all brands 
    app.get("/brands", async (req, res) => {
        const result = await brandsCollections.find().toArray();
        res.send(result);
    })

    // find brand
    app.get("/brands/:id", async (req, res) => {
        const id = req.params.id;
        const filter = {_id : new ObjectId(id)};
        const result = await brandsCollections.findOne(filter);
        res.send(result);
    })

    // Create new brand 
    app.post("/brands", async (req, res) => {
        const brand = req.body;
        const result = await brandsCollections.insertOne(brand);
        res.send(result);
    })

    
    // Update all brands 
    app.put("/brands/:id", async (req, res) => {
        const id = req.params.id;
        const filter = {_id : new ObjectId(id)};
        const brand = req.body;
        const options = { upsert: true };
        const updateBrand = {
            $set: brand,
        }
        
        const result = await brandsCollections.updateOne(filter, updateBrand,options);
        res.send(result);
    })

    // Delete brand
    app.delete("/brands/:id", async (req, res) => {
        const id = req.params.id;
        const filter = {_id : new ObjectId(id)};
        const result  = await brandsCollections.deleteOne(filter);
        res.send(result);
    })

    // Create user
    app.post("/users", async (req,res) => {
        const user = req.body;
        const result = await usersCollections.insertOne(user);
        res.send(result);
    })

    // find user with ID
    app.get("/users/:email", async (req,res) => {
        const getEmail = req.params.email;
        const filter= {email : getEmail };
        const result = await usersCollections.findOne(filter)
        res.send(result);
    })


    // Brand wish product get
    app.get("/brand-wish/:id", async (req, res) => {
        const brandId = req.params.id;
        const filter = {brand_id : brandId }
        const result = await productsCollections.find(filter).toArray();
        res.send(result)
    });

    // Product add to card
    app.post("/add-to-card", async (req,res) => {
        const productId = req.body;
        const result = await cartsCollections.insertOne(productId);
        res.send(result)
    })
   
    // get all carts products
    app.get("/my-card-product/:email", async (req,res) => {
        const filterCartWithEmail = req.params.email;
        const products = await productsCollections.find().toArray();
        const carts = await cartsCollections.find({user_email : filterCartWithEmail }).toArray();

        const newArry  = [];
        for(let item of carts){
            const find = products?.find(prod => prod._id == item.product_id);
            if( find ){
                newArry.push(find);
            }
        }
        res.send(newArry)
    })

    app.delete("/cart-delete/:id", async (req,res) => {
        const id  = req.params.id;
        const filter = {product_id : id};
        const result = await cartsCollections.deleteOne(filter);
        res.send(result);
    })


    // Total product count for Paginations
    app.get("/totalProducts", async (req, res) => {
        const count = await productsCollections.estimatedDocumentCount();
        res.send({count})
    })

    // pagination wish product
    app.get("/prdouct-page", async (req, res) => {
        const page = parseInt(req.query?.page)
        const size = parseInt(req.query?.size)
        const result = await productsCollections.find().skip(page*size).limit(size).toArray();
        res.send(result)
    })


    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/", (req, res) => {
    res.send("Server is running")
})
  
  
app.listen(port , () => {
    console.log(`DB connect at port ${port}`);
})
  