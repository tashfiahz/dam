/*
app.get('/retrieve' ,  async (req, res) => {
    const{type, name, tag, username} = req.body;
    let retri = {username};

    //determines which of the fields were sent as a parameter
    //avoids need for mutliple functions for if single param
    //or multiple were sent
    if(type){
        retri.type = type;
    }
    if(name){
        retri.name = name;
    }
    if(tag){
        retri.tag = tag;
    }

    try {
        const result = await coll.find(retri).toArray();
        res.send(result);
    } catch (error) {
        res.status(500).send({ message: 'Error retrieving data and assets', error });
    }

});

app.get('/search' ,  async (req, res) => {
    const{username, project, name} = req.body;
    let search = {username, project, name};

    try {
        const result = await coll.find(search).toArray();
        res.send(result);
    } catch (error) {
        res.status(500).send({ message: 'Error retrieving data and assets', error });
    }

});


//retrieves all files in selected project folder
//returns all files and can later be sorted through
//with help from retrieve function
app.get('/retrieve-project' ,  async (req, res) => {
    const {username, project } = req.query;
    try {
        if(files.length > 0){
            const result = await coll.find({username, project}).toArray();
            res.send(result);
        }else{
            res.status(404).send({message: "Project Folder is Empty"});
        }        
    } catch (error) {
        res.status(500).send({ message: 'Error retrieving projects', error });
    }

});


//updates the selected asset
//sorts by its url and correspondig user/project
//updates name and description for now
app.post('/update' ,  async (req, res) => {
    const {url, name, description, username, project} = req.body;

    try {
        const result = await coll.updateOne(
            {url, username, project},
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

//removes asset and all corresponfing data
//from both mongodb and its gcs location
app.post('/remove' ,  async (req, res) => {
    const {url, username, project} = req.body;
    //const foundasset = await coll.findOne({url});
    //await coll.deleteOne({_id: foundasset._id})
    try{
        const foundasset = await coll.findOne({url, username, project});

        if (foundasset) {
            await coll.deleteOne({_id: foundasset._id})
            await storage.bucket(username).file(url).delete()
            res.send({ message: 'Asset removed' });
        } else {
            res.status(500).send({ message: 'asset not found ' });
        }

    } catch (error) {
        res.status(500).send({ message: 'Error deleting the metadata', error });

    }


});


/*
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
