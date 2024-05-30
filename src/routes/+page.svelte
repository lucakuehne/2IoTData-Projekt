<h1>Welcome to SvelteKit</h1>
<p>Scanned product: {scannedProduct}</p>


<script>
    import mqtt from "mqtt"
    let client = mqtt.connect("mqtt://localhost");

    let scannedProduct = "";

    client.on("connect", () => {
        client.subscribe("#");
    });

    client.on("message", (topic, message) => {
        // message is Buffer
        //console.log(message.toString());
        scannedProduct = message.toString();
        console.log(scannedProduct);
        scannedProduct = scannedProduct;
        client.end();
    });
    
</script>