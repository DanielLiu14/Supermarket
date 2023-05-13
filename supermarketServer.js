const path = require("path");
const express = require("express");
const portNumber = 5000;
const bodyParser = require("body-parser");

const app = express();

app.set("views", path.resolve(__dirname, "templates"));

app.use(bodyParser.urlencoded({extended:false}));

app.set("view engine", "ejs");

process.stdin.setEncoding("utf8");

class ItemInformation {
    #private;

    constructor (json) {
        this.#private = json;
    }

    renderJson() {
        return require('./' + this.#private);
    }

    getItemList() {
        return this.renderJson().itemsList;
    }
}

if (process.argv[2] && !(process.argv[3])) {
    const data = new ItemInformation(process.argv[2]);

    app.listen(portNumber);

    app.get("/", (request, response) => {
        response.render("index");
    });

    app.get("/catalog", (request, response) => {
        let items = data.getItemList();
        let itemsTable = "<table border='1'><tr><th>Item</th><th>Cost</th></tr>";

        items.forEach(createTable);

        itemsTable += "</table>"

        function createTable(item) {
            itemsTable += "<tr><td>" + item.name + "</td><td>" + item.cost.toFixed(2) + "</td></tr>"
        }
        
        response.render("displayItems", {itemsTable: itemsTable});
    });

    app.get("/order", (request, response) => {
        let items = data.getItemList();
        let itemSelect = "";

        items.forEach(createSelect);

        function createSelect(item) {
            itemSelect += '<option value = "' + item.name + " " + item.cost + '" >' + item.name + "</option>"
        }
        
        response.render("placeOrder", {items: itemSelect});
    });

    app.post("/order", (request, response) => {
        let {name, email, delivery, itemsSelected} = request.body;
        let total = 0;

        if (Array.isArray(itemsSelected) === false) {
            itemsSelected = [itemsSelected];
        }

        let orderTable = "<table border='1'><tr><th>Item</th><th>Cost</th></tr>";

        itemsSelected.forEach(createTable);

        orderTable += "<tr><td>Total Cost:</td><td>" + total.toFixed(2) + "</td></tr></table>";

        function createTable(item) {
            let itemSplit = item.split(" ");
            let price = Number(itemSplit[1]);
            orderTable += "<tr><td>" + itemSplit[0] + "</td><td>" + price.toFixed(2) + "</td></tr>";
            total += price;
        }

        response.render("orderConfirmation", {name: name, email: email, delivery: delivery, orderTable: orderTable});
    });
    
    console.log(`Web server is running at http://localhost:${portNumber}`);

    const prompt = "Type itemsList or stop to shutdown the server: ";

    process.stdout.write(prompt);

    process.stdin.on('readable', () => {
        let dataInput;
        while ((dataInput = process.stdin.read()) !== null) {
            let command = dataInput.trim();
            if (command === "stop") {
                console.log("Shutting down the server");
                process.exit(0);
            } else if (command === "itemsList") {
                console.log(data.getItemList());
            } else {
                console.log(`Invalid command: ${command}`);
            }
            process.stdout.write(prompt);
            process.stdin.resume();
        }
    });
} else {
    console.log('Usage supermarketServer.js jsonFile');
}