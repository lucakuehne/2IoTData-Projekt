<script>
    import mqtt from "mqtt"
    import { MongoClient } from "mongodb"
    
    const client = mqtt.connect("ws://192.168.10.131:9001");
    const dbUser = "lucakuehne";
    const dbPw = "ECcgJ55JPVgDYqQ5";
    const dbUri = "mongodb+srv://lucakuehne:ECcgJ55JPVgDYqQ5@2iotdata.k4q2epp.mongodb.net/?retryWrites=true&w=majority&appName=2iotdata";
    const dbClient = new MongoClient(dbUri);

    let products;

    $: scannedProduct = "";
    $: amountToAdd = 0;
    $: amountToRemove = 0;

    client.on("connect", () => {
        client.subscribe("#");
    });

    client.on("message", (topic, message) => {
        // message is Buffer
        //console.log(message.toString());
        scannedProduct = message.toString();
        console.log(scannedProduct);
        scannedProduct = scannedProduct;
        //client.end();
    });

    async function getProducts() {
        try {
            const database = dbClient.db('2iotdata');
            const productsCollection = database.collection('products');
            //const query = { title: 'Back to the Future' };
            //const product = await products.findOne(query);
            products = await productsCollection.find({}).toArray();
            console.log(products);
        } finally {
            // Ensures that the client will close when you finish/error
            await dbClient.close();
        }
    }

    getProducts()
    
</script>

<div class="flex flex-row">
    <div class="card m-4 p-4 w-1/5 bg-green-50 border-primary-300 border">
        <h2 class="h3">Produkt hinzufügen</h2>
        <hr class="my-2" />
        <label class="label my-2">
            <span>Produkt-Name</span>
            <input class="input" title="produkt-Name" type="text" placeholder="Enter product name" bind:value={scannedProduct} />
        </label>
        <label class="label my-2">
            <span>Anzahl</span>
            <div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
                <button class="variant-filled-secondary" on:click={() => amountToAdd-=1}>-</button>
                <input title="Anzahl" type="text" placeholder="Enter amount" bind:value={amountToAdd} />
                <button class="variant-filled-secondary" on:click={() => amountToAdd+=1}>+</button>
            </div>
        </label>
        <label class="label my-2">
            <span>Mindesthaltbarkeitsdatum</span>
            <input class="input" title="Input (date)" type="date" />
        </label>
        <button type="button" class="btn my-2 w-full bg-green-500">Hinzufügen</button>
    </div>
    
    <div class="card m-4 p-4 w-1/5 bg-red-50 border-red-300 border">
        <h2 class="h3">Produkt entnehmen</h2>
        <hr class="my-2" />
        <label class="label my-2">
            <span>Produkt</span>
            <select class="select">
                <option value="1">Option 1</option>
                <option value="2">Option 2</option>
                <option value="3">Option 3</option>
                <option value="4">Option 4</option>
                <option value="5">Option 5</option>
            </select>
        </label>
        <label class="label my-2">
            <span>Anzahl</span>
            <div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
                <button class="variant-filled-secondary" on:click={() => amountToRemove-=1}>-</button>
                <input title="Anzahl" type="text" placeholder="Enter amount" bind:value={amountToRemove} />
                <button class="variant-filled-secondary" on:click={() => amountToRemove+=1}>+</button>
            </div>
        </label>
        <label class="label my-2">
            <span>Mindesthaltbarkeitsdatum</span>
            <select class="select">
                <option value="1">Option 1</option>
                <option value="2">Option 2</option>
                <option value="3">Option 3</option>
                <option value="4">Option 4</option>
                <option value="5">Option 5</option>
            </select>
        </label>
        <button type="button" class="btn my-2 w-full bg-red-500">Entnehmen</button>
    </div>

    <div class="card m-4 p-4 w-1/5 bg-blue-50 border-blue-300 border">
        <h2 class="h3">Aktuelle Produkte</h2>
        <hr class="my-2" />
        <div class="card p-2 my-2">Artikel</div>
        <div class="card p-2 my-2">Artikel</div>
        <div class="card p-2 my-2">Artikel</div>
    </div>
</div>