<script>
    import mqtt from "mqtt"
    let client = mqtt.connect("ws://192.168.10.131:9001");

    $: scannedProduct = "";
    $: amountToAdd = 0;

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
    
</script>

<div class="card m-4 p-4 w-1/6">
    <h2 class="h2">Neues Produkt</h2>
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
    <button type="button" class="btn variant-filled my-2 w-full">Hinzufügen</button>
</div>