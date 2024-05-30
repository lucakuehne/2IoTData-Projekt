<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>


<script>
    import mqtt from "mqtt"
    let client = mqtt.connect("mqtt://localhost");

    client.on("connect", () => {
        client.subscribe("presence", (err) => {
            if (!err) {
                client.publish("presence", "Hello mqtt");
            }
        });
    });

    client.on("message", (topic, message) => {
        // message is Buffer
        console.log(message.toString());
        //client.end();
    });
    
</script>