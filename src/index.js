require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");
const config = require("./config/config");

let server;
const DB_URI = process.env.MONGODB_URL
const PORT = process.env.PORT

mongoose.connect(DB_URI, { useNewUrlParser: true } ).then(()=>{
    app.listen(PORT,()=>{
        console.log("Listening at", PORT);
    })
    console.log("Connected to DB at", DB_URI)
}).catch((err)=>{
    console.log("Failed to connect to DB", err)
})

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Create Mongo connection and get the express app to listen on config.port


