const http = require('http');
const fs = require('fs');
const qs = require('qs');
const url = require('url')

const handle = {
    calculator: undefined,
    result: undefined,
    notFound: undefined
}

handle.calculator = (req, res) => {
    fs.readFile('./calculator.html', "utf-8", (err, data) => {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        return res.end();
    })
}

handle.result = (req, res) => {
    fs.readFile('./result.html', "utf-8", (err, data) => {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        return res.end();
    })
}

handle.notFound = (req, res) => {
    fs.readFile('./notfound.html', "utf-8", (err, data) => {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        return res.end();
    })
}

const router = {
    'calculator': handle.calculator,
    'result': handle.result
}

const server = http.createServer((req, res) => {
    const parseUrl = url.parse(req.url, true)
    const path = parseUrl.pathname
    const trimPath = path.replace(/^\/+|\/+$/g, '');
    const chosenHandle = (typeof (router[trimPath]) !== 'undefined') ? router[trimPath] : handle.notFound;
    chosenHandle(req, res);
    if (req.method === 'GET') {
        fs.readFile('./calculator.html', "utf-8", (err, data) => {
            if (err) {
                console.log(err.message)
            } else {
                res.writeHead(200, {'Content-Type': "text/html"});
                res.write(data);
                return res.end();
            }
        });
    } else {
        let dataInput = '';
        req.on('data', chunk => {
            dataInput += chunk;
        })
        req.on("end", () => {
            const info = qs.parse(dataInput)
            fs.readFile('./result.html', "utf-8", (err, data) => {
                if (err) {
                    console.log(err.message);
                } else {
                    const nb1 = +info.nb1
                    const nb2 = +info.nb2
                    const operator = info.operator
                    const result = eval(nb1 + operator + nb2)
                    data = data.replace('{none}', result);
                    const stringResult = String(result)
                    fs.writeFile('./data.json', stringResult, (err) => {
                        if (err) {
                            console.log(err.message)
                        }
                    })
                    res.writeHead(200, {'Content-Type': "text/html"});
                    res.write(data);
                    return res.end();
                }
            })
        })
    }
});
server.listen(8080, 'localhost', () => {
    console.log('sever is running');
});


