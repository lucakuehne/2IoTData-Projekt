<script>
    import { onMount } from 'svelte';
    import mqtt from "mqtt"
    import axios from "axios"
    import { initializeStores, Toast, getToastStore } from '@skeletonlabs/skeleton';
    initializeStores();
    import { Autocomplete } from '@skeletonlabs/skeleton';
    
    //const client = mqtt.connect("ws://192.168.10.131:9001");
    const client = mqtt.connect("ws://192.168.1.122:9001");
    const toastStore = getToastStore();

    let products = [];
    
    $: newProduct = {
        name: "",
        amount: 0,
        expirationDate: ""
    };

    $: productToRemove = {
        name: "",
        amount: 0,
        expirationDate: ""
    };

    client.on("connect", () => {
        client.subscribe("#");
    });

    client.on("message", (topic, message) => {
        // message is Buffer
        newProduct.name = message.toString();
        console.log(newProduct.name);
        newProduct.name = newProduct.name;
        //client.end();
    });

    function clearNewProduct() {
        newProduct.name = "";
        newProduct.amount = 0;
        newProduct.expirationDate = "";
    }

    function setProductToRemove(product, inventoryItem) {
        productToRemove.name = product.name
        productToRemove.expirationDate = inventoryItem.expirationDate
    }

    function clearProductToRemove() {
        productToRemove.name = "";
        productToRemove.amount = 0;
        productToRemove.expirationDate = "";
    }

    async function listProducts() {
        axios.get("/api/products")
        .then(function (res) {
            console.log(res.data);
            products = res.data.body.sort((a, b) => {
                const nameA = a.name.toUpperCase(); // ignore upper and lowercase
                const nameB = b.name.toUpperCase(); // ignore upper and lowercase
                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }
                return 0;
            });
        })
        .catch(function (err) {
            console.log(err);
        });
    }

    async function addProduct() {
        axios.post("/api/products", newProduct)
        .then(function (res) {
            //console.log(res.data);
            if (res.status == 200) {
                clearNewProduct();
                toastStore.trigger({
                    message: 'Product added successfully',
                    background: 'bg-green-500'
                });
                listProducts();
            }
        })
        .catch(function (err) {
            console.log(err);
        });
    }

    async function removeProduct() {
        //console.log(productToRemove);
        axios.delete("/api/products", { data: productToRemove })
        .then(function (res) {
            console.log(res.data);
        })
    }

    onMount(() => {
		listProducts();
	});
    
</script>

<Toast />

<div class="flex gap-4 p-4">
    <div class="card p-4 basis-1/4 flex-1 bg-green-50 border-primary-300 border">
        <h2 class="h3">Produkt hinzufügen</h2>
        <hr class="my-2" />
        <label class="label my-2">
            <span>Name</span>
            <input class="input" title="produkt-Name" type="text" placeholder="Enter product name" bind:value={newProduct.name} />
        </label>
        <label class="label my-2">
            <span>Anzahl</span>
            <div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
                <button class="variant-filled-secondary" on:click={() => newProduct.amount-=1}>-</button>
                <input title="Anzahl" type="text" placeholder="Enter amount" bind:value={newProduct.amount} />
                <button class="variant-filled-secondary" on:click={() => newProduct.amount+=1}>+</button>
            </div>
        </label>
        <label class="label my-2">
            <span>Mindesthaltbarkeitsdatum</span>
            <input class="input" title="Input (date)" type="date" bind:value={newProduct.expirationDate}/>
        </label>
        <button type="button" class="btn my-2 w-full bg-green-500" on:click={addProduct}>Hinzufügen</button>
    </div>

    <div class="card p-4 basis-1/2 flex-1 bg-blue-50 border-blue-300 border">
        <h2 class="h3">Aktuelle Produkte</h2>
        <hr class="my-2" />
        {#each products as product}
            <div class="card p-2 my-2">
                <b>{product.name} (x{product.amount}):</b>
                <ul>
                    {#each product.inventory as inventoryItem}
                        <li>
                            {inventoryItem.expirationDate} (x{inventoryItem.amount})
                            <button class="btn p-0 px-4 bg-red-500" on:click={setProductToRemove(product, inventoryItem)}>→</button>
                        </li>
                    {/each}
                </ul>
            </div>
        {/each}
    </div>

    <div class="card p-4 basis-1/4 flex-1 bg-red-50 border-red-300 border">
        <h2 class="h3">Produkt entnehmen</h2>
        <hr class="my-2" />
        {#if productToRemove.name == null}
            <span class="text-center inline-block align-middle">Bitte wählen Sie links ein Produkt, um es entfernen zu können.</span>
        {:else}
            <b>Name:</b>
            <p>{ productToRemove.name }</p>
            <br>
            <b>Mindesthaltbarkeitsdatum:</b>
            <p>{ productToRemove.expirationDate }</p>
            <br>
            <label class="label my-2">
                <span>Anzahl</span>
                <div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
                    <button class="variant-filled-secondary" on:click={() => productToRemove.amount-=1}>-</button>
                    <input title="Anzahl" type="text" placeholder="Enter amount" bind:value={productToRemove.amount} />
                    <button class="variant-filled-secondary" on:click={() => productToRemove.amount+=1}>+</button>
                </div>
            </label>
            <button type="button" class="btn my-2 w-full bg-red-500" on:click={removeProduct}>Entnehmen</button>
        {/if}
    </div>
</div>