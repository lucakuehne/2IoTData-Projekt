<script>
    import mqtt from "mqtt"
    //import { MongoClient } from "mongodb"
    import { env } from '$env/dynamic/public'
    
    //const client = mqtt.connect("ws://192.168.10.131:9001");
    const client = mqtt.connect("ws://192.168.1.122:9001");
    // const dbClient = new MongoClient(env.PUBLIC_DB_URI);

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
        const res = await fetch(
            '/api',
            { method: 'GET' }
        );
        const { products } = await res.json();

        if (res.ok) {
            console.log(products);
            return {
                props: {
                    products
                }
            }
        } else {
            return {
                status: res.status
            }
        }
    }

    //getProducts()
    
</script>

<div class="flex gap-4 p-4">
    <div class="card p-4 basis-1/4 flex-1 bg-green-50 border-primary-300 border">
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
    
    <div class="card p-4 basis-1/4 flex-1 bg-red-50 border-red-300 border">
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

    <div class="card p-4 basis-1/2 flex-1 bg-blue-50 border-blue-300 border">
        <h2 class="h3">Aktuelle Produkte</h2>
        <hr class="my-2" />
        <div class="card p-2 my-2">Artikel</div>
        <div class="card p-2 my-2">Artikel</div>
        <div class="card p-2 my-2">Artikel</div>
    </div>
</div>

<button class="btn border-solid border border-gray-800 hover:bg-gray-800" on:click={getProducts}>Load products</button>