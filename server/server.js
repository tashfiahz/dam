
import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import cors from 'cors';
import multer from 'multer'
import { dirname, join } from 'path';
import { fileURLToPath } from 'url'; // Import to define __dirname in ESM
dotenv.config();
import { Storage } from '@google-cloud/storage';
import { MongoClient, ServerApiVersion } from 'mongodb';

const app = express();
app.use(cors());
app.use(express.json());
const port = 3500;

const image_api = 'https://api.bing.microsoft.com/v7.0/images/visualsearch';
const image_api_key = process.env.IMAGE_API_KEY;

const audio_api = 'https://enterprise.audd.io/';
const audio_api_key = process.env.AUDIO_API_KEY;

const storage = new Storage();
const bucket_name = 'damcap';
const video_file_name = 'beethoven.mp4';
const photo_file_name = '3ce849b6bd850b315d92ebbfb2ea4566.jpg';

//const __dirname = path.dirname(__filename);
const __dirname = dirname(fileURLToPath(import.meta.url));

const storages = new Storage({
    keyFilename: join(__dirname, 'keys.json'), 
});

const uri = 'mongodb+srv://albertgolebick:SVVindYlaFN9T2p6@dammeta.qcxziaz.mongodb.net/?retryWrites=true&w=majority&appName=Dammeta';
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

const bucket = storages.bucket(bucket_name); 
const upload = multer({ storage: multer.memoryStorage() });

let db;

async function connectToDatabase() {
    await client.connect();
    db = client.db('test1');
    db = db.collection('Coals');
}


const storageup = new Storage({
  keyFilename: join(__dirname, 'keys.json'), 
});


app.post('/upload-gcs', upload.single('file'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
  
    const file = bucket.file(req.file.originalname);
    const fileStream = file.createWriteStream({ resumable: false });
  
    fileStream.on('finish', async () => {
      const url = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
      res.status(200).json({ url });
    });
  
    fileStream.on('error', (err) => {
      console.error('File stream error:', err);
      res.status(500).json({ message: 'File upload failed', error: err.message });
    });
  
    fileStream.end(req.file.buffer);
  });
  
  app.post('/upload-mongo', async (req, res) => {
    const { tag, type, name, description, url } = req.body;
  
    try {
      const result = await db.insertOne({ tag, type, name, description, url });
      res.send(result);
    } catch (error) {
      res.status(500).send({ message: 'Error inserting data', error });
    }
  });
  
  // Main function to start the server
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




















async function generateV4ReadSignedURL(file_name) {
    const options = {
        version: 'v4',
        action: 'read',
        expires: Date.now() + 15 * 60 * 1000,
    };
    const url= await storage.bucket(bucket_name).file(file_name).getSignedUrl(options);
    console.log('Generated GET signed URL: ');
    console.log(url[0]);
    return url[0];
}


//app.get('/', (req, res) => {
    //res.json('ExpressJS server response OK!')
//})

//app.listen(port, () => {
    //console.log(`ExpressJS server listening on PORT: ${port}`)
//})

app.get('/image_search', async (req, res) => {
    const photo_url = await generateV4ReadSignedURL(photo_file_name);

    //POST BODY FORMAT
    /* 
        --boundary_1234-abcd
        Content-Disposition: form-data; name="knowledgeRequest"

        {
            "imageInfo" : {
                "url" : "https://contoso.com/2018/05/fashion/red.jpg"
            }
        }

        --boundary_1234-abcd--
    */

    const boundary = 'boundary_1234-abcd';
    const info = {
        imageInfo: {
            url : photo_url
        }
    };
    const body = `--${boundary}\r\n` + 
                 'Content-Disposition: form-data; name="knowledgeRequest"\r\n\r\n' + 
                 `${JSON.stringify(info)}\r\n` + 
                 `--${boundary}--`;
    try {
        const response = await axios.post(image_api, body, {
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Ocp-Apim-Subscription-Key': image_api_key
            }
        });
        res.send(response.data);
    } catch (error) {
        console.error(error);
        res.send(error.message);
    }
});


//LIMIT TESTING TO PRESERVE MONTHLY REQUESTS
app.get('/audio_recognition', async (req, res) => {
    const video_url = await generateV4ReadSignedURL(video_file_name);
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
        console.error(error);
        res.send(error.message);
    }
});

app.get('/cloud_test', async (req, res) => {
    try {
        const test = await generateV4ReadSignedURL(video_file_name);
        res.send({test});
    } catch (error) {
        console.error(error);
        res.send(error.message);
    }
})