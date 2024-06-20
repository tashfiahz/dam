import express from 'express';
import axios from 'axios';
import fs from 'fs';

const app = express();
const port = 3000;

const image_api = 'https://api.bing.microsoft.com/v7.0/images/visualsearch';
const image_api_key = '053301e1a8d841659d928a5476a0c395';

const audio_api = 'https://api.audd.io/recognize';
const audio_api_key = '173e87ad96719cbe62d0f07b4d5f4d1f';

app.get('/', (req, res) => {
    res.json('ExpressJS server response OK!')
})

app.listen(port, () => {
    console.log(`ExpressJS server listening on PORT: ${port}`)
})

app.get('/image_search', async (req, res) => {
    const test = 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Aptenodytes_forsteri_-Snow_Hill_Island%2C_Antarctica_-adults_and_juvenile-8.jpg';

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
            url : test
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

app.get('/audio_recognition', async (req, res) => {
    const info = {
        'api_token': audio_api_key,
        'file': fs.createReadStream('./test_media/beethoven.mp4'),
        'return': 'apple_music,spotify'
    }
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