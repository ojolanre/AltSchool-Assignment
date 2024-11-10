const http = require("http");
const fs = require("fs");
const path = require("path");

const hostname = 'localhost';
const port = 3000;

/**
 * Reads and returns the contents of an HTML file
 */
const htmlFileHandler = function (req, res) {
    const htmlFilePath = path.join(__dirname, "static", "index.html");
    fs.readFile(htmlFilePath, function (error, html) {
        if (error) {
            console.error(error);
            res.writeHead(500);
            res.end("Error loading HTML file");
        } else if (req.url === '/index.html') {
            res.setHeader("Content-Type", "text/html");
            res.writeHead(200);
            res.write(html);
            res.end();
        } else {
            res.writeHead(404);
            res.end(JSON.stringify({
                message: 'Not Found'
            }))
        }
    });
}


// Create the server
const server = http.createServer(htmlFileHandler)
    server.listen(port, hostname, () => {
        console.log(`Server running at http://${hostname}:${port}/`);
    })