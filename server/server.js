import express from 'express';
import cors from 'cors';
import supertokens from "supertokens-node";
import { SuperTokensConfig } from './config.js';
import { verifySession } from "supertokens-node/recipe/session/framework/express"
import { middleware, errorHandler } from "supertokens-node/framework/express";
import axios from 'axios';
import dotenv from 'dotenv';
import multer from 'multer'
//import { dirname, join } from 'path';
//import { fileURLToPath } from 'url'; // Import to define __dirname in ESM
import { Storage } from '@google-cloud/storage';
import { MongoClient, ServerApiVersion } from 'mongodb';

dotenv.config();

supertokens.init(SuperTokensConfig);

const app = express();
app.use(express.json());
const port = 3501;
const upload = multer();

app.use(cors({
    origin: "http://localhost:3000",
    allowedHeaders: ["content-type", ...supertokens.getAllCORSHeaders()],
    methods: ["GET", "PUT", "POST", "DELETE"],
    credentials: true,
}));

app.use(middleware());

app.get('/get_user_info', verifySession(), async (req, res) => {
    try {
        let userId = req.session.getUserId();
        let userInfo = await supertokens.getUser(userId);
        res.send(userInfo);
    } catch (error) {
        console.error(error);
        res.send(error.message);
    }
})

//const __dirname = path.dirname(__filename);
//const __dirname = dirname(fileURLToPath(import.meta.url));

const storage = new Storage({
    //keyFilename: join(__dirname, 'keys.json'),
    keyFilename: 'keys.json', 
});

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
let db;
async function connectToDatabase() {
    await client.connect();
    db = client.db('test1').collection('Coals');
}

//Main function to start the server
async function main() {
    try {
        await connectToDatabase();
        console.log('Connected to MongoDB');
        app.listen(port, () => {
            console.log(`Server Listening On Port:${port}`);
        });
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
    }
}
main().catch(console.error);

//Check if user already exists and has a GCS bucket, if not, create a new one
app.post('/check-bucket', async (req, res) => {
    const { userId } = req.body;
    const bucketName = userId;
    try {
        const [buckets] = await storage.getBuckets();
        const bucketExists = buckets.some(bucket => bucket.name === bucketName);
        if (!bucketExists) {
            await storage.createBucket(bucketName);
            res.send({ message: `Bucket ${bucketName} created for new user`});
        } 
        else {
            res.send({ message: `Bucket ${bucketName} already exists for user`});
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error checking for/creating bucket', error });
    }
});

app.post('/retrieve-projects', async (req, res) => {
    const { userId } = req.body;
    try {
        const result = await db.distinct('project', { userId });
        res.send(result.length ? result : []);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error retrieving projects', error });
    }

});

app.post('/create-project' ,  async (req, res) => {
    const { userId, project } = req.body;
    try {
        const foundproject = await db.findOne({ userId, project});
        if (foundproject) {
            res.send({ message: 'Project already exists' });
        } 
        else {
            await db.insertOne({ userId, project});
            return res.send({ message: 'Project created successfully' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error uploading project', error });

    }
});

app.post('/delete-project', async (req, res) => {
    const { userId, project } = req.body;
    const bucketName = userId;
    try {
        //Get all metadata for files in project, save their file names
        const files = await db.find({ userId, project }).toArray();
        const filenames = files.map(file => file.name);
        //Delete all metadata for files in project
        await db.deleteMany({ userId, project });
        console.log(filenames);
        if (filenames.length > 0) {
            //Create array of promises with each item being a promise for deleting a file from GCS
            const deletions = filenames.map(name => storage.bucket(bucketName).file(name).delete());
            //Wait for all promises to resolve
            await Promise.all(deletions);
        }
        res.send({ message: 'Project and its files deleted from both MongoDB and GCS'});
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error deleting project', error });
    }
})

app.post('/rename-project', async (req, res) => {
    const { userId, project, newproject } = req.body;
    try {
        const update = await db.updateMany(
            { userId: userId, project: project },
            { $set: { project: newproject }}
        );
        if (update.modifiedCount > 0) {
            res.send({ message: 'Project renamed successfully'});
        }
        else {
            res.status(404).send({ message: 'No entries found for given project name'});
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error renaming project', error });
    }
})

app.post('/upload-gcs', upload.single('file'), async (req, res) => {
    const { userId } = req.body;
    const bucketName = userId;
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(req.file.originalname);
    const fileStream = file.createWriteStream({ resumable: false });
    fileStream.on('finish', async () => {
        //Instead of having GCS return authenticated URL (needs Google login to access), have it return long-lasting signed URL
        const expiration = new Date();
        expiration.setFullYear(expiration.getFullYear() + 10);
        const [url] = await file.getSignedUrl({
            action: 'read',
            expires: expiration
        });
        res.status(200).json({ url });
    });
    fileStream.on('error', (err) => {
        console.error('File stream error:', err);
        res.status(500).json({ message: 'File upload failed', error: err.message });
    });
    fileStream.end(req.file.buffer);
});

app.post('/upload-mongo', async (req, res) => {
    const { userId, projectname, filetype, filename, url } = req.body;
    const metadata = {
        project: projectname,
        description: "",
        name: filename,
        tags: [],
        type: filetype,
        url: url,
        userId: userId
    };
    try {
        const result = await db.insertOne(metadata);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({ message: 'Error inserting data', error });
    }
});

app.post('/retrieve' ,  async (req, res) => {
    const{ type, name, tag, projectname, userId } = req.body;
    let retri = { userId };
    //determines which of the fields were sent as a parameter
    //avoids need for mutliple functions for if single param
    //or multiple were sent
    if (type) {
        retri.type = type;
    }
    if (name) {
        retri.name = name;
    }
    if (tag) {
        retri.tags = { $elemMatch: { $eq: tag } };
    }
    if (projectname) {
        retri.project = projectname;
    }
    try {
        const result = await db.find({
            ...retri,
            //Only get metadata that has all fields. Ignore metadata that is just userId and project fields that is added when a user creates an empty project
            $or: [
                { description: { $exists: true }},
                { tags: { $exists: true }},
                { name: { $exists: true }},
                { type: { $exists: true }},
                { url: { $exists: true }},
            ]
        }).toArray();
        res.send(result);
    } catch (error) {
        res.status(500).send({ message: 'Error retrieving data and assets', error });
    }
});

/*
app.post('/image_search', async (req, res) => {
    const image_api_key = process.env.GOOGLE_IMAGE_KEY;
    const photo_url = req.body.url
    const response = await getJson({
        engine: "google_reverse_image",
        image_url: photo_url,
        api_key: image_api_key
    }, (json) => {
        json(["inline_images"]);
    });
    res.send(response);
});
*/

async function generateV4ReadSignedURL(bucket_name, file_name) {
    const options = {
        version: 'v4',
        action: 'read',
        expires: Date.now() + 15 * 60 * 1000,
    };
    const url = await storage.bucket(bucket_name).file(file_name).getSignedUrl(options);
    console.log('Generated GET signed URL: ');
    console.log(url[0]);
    return url[0];
}

//LIMIT TESTING TO PRESERVE MONTHLY REQUESTS
app.post('/audio_recognition', async (req, res) => {
    const audio_api = 'https://enterprise.audd.io/';
    const audio_api_key = process.env.AUDIO_API_KEY;
    const { userId, name } = req.body
    const video_url = await generateV4ReadSignedURL(userId, name);
    const info = {
        'api_token': audio_api_key,
        'url': video_url,
        'accurate_offsets': 'true',
        'skip': '0',
        'every': '1',
       };
    try {
       const response = await axios.post(audio_api, info, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
       });
       res.send(response.data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send(error.message);
    }
});

//------------------------------------MEDIA CRUD---------------------------------
/*

app.post('/update', async (req, res) => {
    //add user 
    const {url, name, description} = req.body;

    try {
        const result = await coll.updateOne(
            {url},
            {
            //tag,
                $set: {
                    name,
                    description
                }
            })
        ;
        res.send(result);
    } catch (error) {
        res.status(500).send({ message: 'Error updating the metadata', error });
    }

});

app.post('/remove', async (req, res) => {
    const {url} = req.body;
    //const foundasset = await coll.findOne({url});
    //await coll.deleteOne({_id: foundasset._id})
    try{
        const foundasset = await coll.findOne({url});

        if (foundasset) {
            await coll.deleteOne({_id: foundasset._id})
            res.send({ message: 'Asset removed' });
        } else {
            res.status(500).send({ message: 'asset not found ' });
        }

    //gcs.bucket.remove
    //await storage.bucket(bucketName).file(url).delete()
    } catch (error) {
        res.status(500).send({ message: 'Error deleting the metadata', error });

    }
});

//---------------------------------------APIS------------------------------------

app.get('/cloud_test', async (req, res) => {
    try {
        const test = await generateV4ReadSignedURL(video_file_name);
        res.send({test});
    } catch (error) {
        console.error(error);
        res.send(error.message);
    }
})

*/

app.use(errorHandler());

app.listen(3500, () => console.log(`Server listening on port ${port}`));

// DO NOT DEFINE ANY ENDPOINTS BELOW THIS POINT! ALL ENDPOINTS MUST BE DEFINED BETWEEN app.use(middleware()); AND app.use(errorHandler());

/*
app.post('/upload', upload.single('asset'), async(req, res) => {
    try{
        //mongo connect
        await client.connect();
        const db = client.db('test1');
        const coll = db.collection('Coals');

        const asset = bucket.asset(req.asset.originalname);//file read

        const assetStream = asset.createWriteStream({
            resumable: false,
        });

        assetStream.on('finish', async() => {
            const Url = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        
            const { tag, type, name, description } = req.body;
            const result = await coll.insertOne({ 
                url: Url,
                tag: tag,
                //type: type,
                name: name, 
                description: description
            });
            res.status(200).send({ url: Url, result: result });
        });
        
        assetStream.end(req.file.buffer);

    }catch (error) {
        console.error('Upload error:', error);
        res.status(500).send('Internal Server Error');
    }finally {
        await client.close();
    }
});
*/
