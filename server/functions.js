/*
app.post('/retrieve' ,  async (req, res) => {
    let retri = {};

    //determines which of the fields were sent as a parameter
    //avoids need for mutliple functions for if single param
    //or multiple were sent
    if(req.body.type){
        retri.type = req.body.type;
    }
    if(req.body.name){
        retri.name = req.body.name;
    }
    if(req.body.tag){
        retri.tag = req.body.tag;
    }

    try {
        const result = await coll.find(retri).toArray();
        res.send(result);
    } catch (error) {
        res.status(500).send({ message: 'Error retrieving data and assets', error });
    }

});

app.get('/retrieve-project' ,  async (req, res) => {
    
    try {
        const result = await coll.distinct("project");
        res.send(result);
    } catch (error) {
        res.status(500).send({ message: 'Error retrieving projects', error });
    }

});

app.post('/update' ,  async (req, res) => {
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

app.post('/remove' ,  async (req, res) => {
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


// Main function to start the server
async function main() {
    try {
        await connectToDatabase();
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server Listening On Port:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
    }
}

*/