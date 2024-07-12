import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
import { Storage } from '@google-cloud/storage';

const app = express();
const port = 3000;

const image_api = 'https://api.bing.microsoft.com/v7.0/images/visualsearch';
const image_api_key = process.env.IMAGE_API_KEY;

const audio_api = 'https://enterprise.audd.io/';
const audio_api_key = process.env.AUDIO_API_KEY;

const storage = new Storage();
const bucket_name = 'damcap';
const video_file_name = 'beethoven.mp4';
const photo_file_name = '3ce849b6bd850b315d92ebbfb2ea4566.jpg';

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


app.get('/', (req, res) => {
    res.json('ExpressJS server response OK!')
})

app.listen(port, () => {
    console.log(`ExpressJS server listening on PORT: ${port}`)
})

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