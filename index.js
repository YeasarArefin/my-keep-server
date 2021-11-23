const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.3xxnz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

async function run() {

    try {

        await client.connect();
        const database = client.db("mykeep");
        const notesCollection = database.collection("notes");

        app.get('/notes', async (req, res) => {

            const email = req.query.email;

            if (email) {
                const query = { email: email };
                const data = await notesCollection.find(query).toArray();
                res.json(data);
            }
            else {
                const data = await notesCollection.find({}).toArray();
                res.json(data);
            }

        });

        app.post('/notes', async (req, res) => {

            const date = new Date();
            const data = req.body;
            data.time = date.toLocaleTimeString();
            data.date = date.toDateString();
            const result = await notesCollection.insertOne(data);
            res.json(result);

        });

        app.get('/notes/:_id', async (req, res) => {

            const _id = req.params._id;
            const query = { _id: ObjectId(_id) };
            const data = await notesCollection.findOne(query);
            res.json(data);

        });

        app.delete('/notes/:_id', async (req, res) => {

            const _id = req.params._id;
            const query = { _id: ObjectId(_id) };
            const data = await notesCollection.deleteOne(query);
            res.json(data);

        });

        app.put('/notes/:_id', async (req, res) => {

            const _id = req.params._id;
            const data = req.body;
            const updatedNote = data.updatedNote;
            const filter = { _id: ObjectId(_id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    note: updatedNote
                }
            };
            const result = await notesCollection.updateOne(filter, updateDoc, options);
            res.json(result);

        });

    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running My Keep Server');
});

app.listen(port, () => console.log('response form port:', port));