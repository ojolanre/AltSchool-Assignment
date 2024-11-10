const http = require('http');
const fs = require('fs');
const path = require('path');

const itemsDbPath = path.join(__dirname, "db", 'items.json');
let itemsDB = [];

const PORT = 8000
const HOST_NAME = 'localhost';

const requestHandler = function (req, res) {
    res.setHeader("Content-Type", "application/json");

    if (req.url === '/items' && req.method === 'GET') {
        getAllItems(req, res);
    } else if (req.url.startsWith('/items') && req.method === 'GET') {
        getItem(req, res);
    } else if (req.url === '/items' && req.method === 'POST') {
        addItem(req, res);
    } else if (req.url === '/items' && req.method === 'PUT') {
        updateItem(req, res);
    } else if (req.url.startsWith('/items') && req.method === 'DELETE') {
        deleteItem(req, res);
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({
            message: 'Method Not Supported'
        }));
    }

}


//RETREIVE ALL items ==> GET /items
const getAllItems = function (req, res) {
    fs.readFile(itemsDbPath, "utf8", (err, items)=> {
        if (err){
            console.log(err)
            res.writeHead(400)
            res.end("An error occured")
        }

        res.end(items);

    })
}

// GET ONE ITEM
const getItem = function (req, res) {
    const ItemId = req.url.split('/')[2]; //Extracts the id from database
  
    //Find item with the specified index
    const item = itemsDB.find((item) => {
        return item.id === parseInt(ItemId);
    })

    if (item === -1) {
        res.writeHead(404);
        res.end(JSON.stringify({
            message: 'Item not found'
        }));

        return;
    }

     // If found, respond with the item data
     res.writeHead(200);
     res.end(JSON.stringify(item));
}

// CREATE A ITEM ==> POST: /items
const addItem = function (req, res) {
    const body = [];

    req.on('data', (chunk) => { // data event is fired when the server receives data from the client
        body.push(chunk); // push each data received to the body array
    });

    req.on('end', () => {
        const parsedBody = Buffer.concat(body).toString(); // concatenate raw data into a single buffer string
        const newItem = JSON.parse(parsedBody); // parse the buffer string into a JSON object

        // get ID of last item in the database
        const lastItem = itemsDB[itemsDB.length - 1];
        const lastItemId = lastItem.id;
        newItem.id = lastItemId + 1;
        
        //save to db
        itemsDB.push(newItem);
        fs.writeFile(itemsDbPath, JSON.stringify(itemsDB), (err) => {
            if (err) {
                console.log(err);
                res.writeHead(500);
                res.end(JSON.stringify({
                    message: 'Internal Server Error. Could not save item to database.'
                }));
            }

            res.end(JSON.stringify(newItem));
        });
    });
}


// UPDATE A ITEM ==> PUT: /items
const updateItem = function (req, res) {
    const body = [];

    req.on('data', (chunk) => { // data event is fired when the server receives data from the client
        body.push(chunk); // push each data received to the body array
    });

    req.on('end', () => {
        const parsedBody = Buffer.concat(body).toString(); // concatenate raw data into a single buffer string
        const ItemToUpdate = JSON.parse(parsedBody); // parse the buffer string into a JSON object

        // find the item in the database
        const ItemIndex = itemsDB.findIndex((item) => {
            return item.id === ItemToUpdate.id;
        });

        // Return 404 if item not found
        if (ItemIndex === -1) {
            res.writeHead(404);
            res.end(JSON.stringify({
                message: 'Item not found'
            }));
            return;
        }

        // update the item in the database
        itemsDB[ItemIndex] = {...itemsDB[ItemIndex], ...ItemToUpdate}; 

        // save to db
        fs.writeFile(itemsDbPath, JSON.stringify(itemsDB), (err) => {
            if (err) {
                console.log(err);
                res.writeHead(500);
                res.end(JSON.stringify({
                    message: 'Internal Server Error. Could not update item in database.'
                }));
            }

            res.end(JSON.stringify(ItemToUpdate));
        });
    });
}


// DELETE A ITEM ==> DELETE: /items
const deleteItem = function (req, res) {
    const ItemId = req.url.split('/')[2];
    // Remove item from database
    const ItemIndex = itemsDB.findIndex((item) => {
        return item.id === parseInt(ItemId);
    })

    if (ItemIndex === -1) {
        res.writeHead(404);
        res.end(JSON.stringify({
            message: 'Item not found'
        }));

        return;
    }

    itemsDB.splice(ItemIndex, 1); // remove the item from the database using the index

    // update the db
    fs.writeFile(itemsDbPath, JSON.stringify(itemsDB), (err) => {
        if (err) {
            console.log(err);
            res.writeHead(500);
            res.end(JSON.stringify({
                message: 'Internal Server Error. Could not delete item from database.'
            }));
        }

        res.end(JSON.stringify({
            message: 'Item deleted'
        }));
    });

}

// Create server
const server = http.createServer(requestHandler)

server.listen(PORT, HOST_NAME, () => {
    itemsDB = JSON.parse(fs.readFileSync(itemsDbPath, 'utf8'));
    console.log(`Server is listening on ${HOST_NAME}:${PORT}`)
})