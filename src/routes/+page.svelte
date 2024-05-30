<script>
    import mqtt from "mqtt"
    let client = mqtt.connect("mqtt://localhost");

    $: scannedProduct = "";

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

<input bind:value={scannedProduct} />