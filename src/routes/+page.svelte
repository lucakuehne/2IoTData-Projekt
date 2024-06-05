<script>
    import { onMount } from 'svelte';
    import mqtt from "mqtt";
    import axios from "axios";
    import { initializeStores, Toast, getToastStore, filter } from '@skeletonlabs/skeleton';
    initializeStores();
    import { Autocomplete } from '@skeletonlabs/skeleton';
    import { popup } from '@skeletonlabs/skeleton';
    import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
    import { storePopup } from '@skeletonlabs/skeleton';
    storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });
    
    //const client = mqtt.connect("ws://192.168.10.131:9001");
    const client = mqtt.connect("ws://192.168.1.122:9001");
    const toastStore = getToastStore();

    let products = [];
    let inventoryItems = [];

    let addProductOptions = [];
    const autocompletePopupSettings = {
        event: 'focus-click',
        target: 'popupAutocomplete',
        placement: 'bottom'
    }
    
    $: newProduct = {
        name: "",
        amount: 0,
        expirationDate: ""
    };

    $: productToRemove = {
        name: "",
        productId: "",
        inventoryId: "",
        amount: 0,
        expirationDate: "",
    };

    client.on("connect", () => {
        client.subscribe("#");
    });

    client.on("message", (topic, message) => {
        console.log(topic + " => " + message);
        // message is Buffer
        if (topic == "doorsensor/newstate") {
            console.log("Door state has changed!")
        } else {
            newProduct.name = message.toString();
            console.log(newProduct.name);
            newProduct.name = newProduct.name;
        }
    });

    function clearNewProduct() {
        newProduct.name = "";
        newProduct.amount = 0;
        newProduct.expirationDate = "";
    }

    function setProductToRemove(product, inventoryItem) {
        productToRemove.name = product.name
        productToRemove.productId = product._id
        productToRemove.inventoryId = inventoryItem._id
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
        listInventory();
        loadProductOptions();
    }

    async function listInventory() {
        axios.get("/api/inventory")
        .then(function (res) {
            inventoryItems = res.data.body.sort((a, b) => {
                if (a.expirationDate < b.expirationDate) {
                    return -1;
                }
                if (a.expirationDate > b.expirationDate) {
                    return 1;
                }
                return 0;
            });
            inventoryItems = inventoryItems;
        })
    }

    async function addProduct() {
        axios.post("/api/products", newProduct)
        .then(function (pRes) {
            if (pRes.status == 200 || pRes.status == 201) {
                let productId = pRes.data.body;
                let updatedNewProduct = newProduct;
                updatedNewProduct.productId = productId;
                axios.post("/api/inventory/", updatedNewProduct)
                .then(function (iRes) {
                    if (iRes.status == 200 || iRes.status == 201) {
                        clearNewProduct();
                        toastStore.trigger({
                            message: 'Produkt wurde erfolgreich hinzugefügt',
                            background: 'bg-green-500'
                        });
                        listProducts();
                    }
                })
                .catch(function (iErr) {
                    toastStore.trigger({
                            message: 'Fehler beim Hinzufügen des Produkts',
                            background: 'bg-red-500'
                    });
                    console.log("Error when adding inventory: " + iErr)
                })
            }
        })
        .catch(function (pErr) {
            toastStore.trigger({
                message: 'Fehler beim Hinzufügen des Produkts',
                background: 'bg-red-500'
            });
            console.log("Error when adding prduct: " + pErr);
        });
    }

    async function removeProduct() {
        //console.log(productToRemove);
        axios.delete("/api/inventory", { data: productToRemove })
        .then(function (iRes) {
            console.log(iRes.data);
            if (iRes.status == 200 || iRes.status == 201) {
                clearProductToRemove();
                toastStore.trigger({
                    message: 'Produkt wurde erfolgreich entfernt',
                    background: 'bg-green-500'
                });
                listProducts();
            } else {
                toastStore.trigger({
                        message: 'Fehler beim Entfernen des Produkts',
                        background: 'bg-red-500'
                });
                console.log("Error when removing inventory: " + iRes.message)
            }
        })
        .catch(function (iErr) {
            toastStore.trigger({
                    message: 'Fehler beim Entfernen des Produkts',
                    background: 'bg-red-500'
            });
            console.log("Error when removing inventory: " + iErr)
        })
    }

    async function loadProductOptions() {
        addProductOptions = [];
        while (products.length < 1) {
            await sleep(500);
        }
        products.forEach(product => {
            addProductOptions.push({
                label: product.name,
                value: product._id
            });
        });
    }

    function sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    function onAddProductSelection(event) {
        newProduct.name = event.detail.label;
    }

   onMount(() => {
		listProducts();
	});
    
</script>

<Toast />

<div class="flex gap-4 p-4">
    <div class="card p-4 flex-1 flex items-center justify-center gap-2">
        <span class="font-bold">Die Temperatur ist:</span><span>XY °C</span>
    </div>
    <div class="card p-4 flex-1 flex items-center justify-center gap-2">
        <span class="font-bold">Der Kühlschrank ist:</span><span>offen / geschlossen</span>
    </div>
</div>

<div class="flex gap-4 p-4 items-start">
    <div class="card p-4 basis-1/4 flex-1 bg-green-50 border-green-300 border">
        <h2 class="h3">Produkt hinzufügen</h2>
        <hr class="my-2" />
        <label class="label my-2">
            <span>Name</span>
            <!-- <input class="input" title="produkt-Name" type="text" placeholder="Enter product name" bind:value={newProduct.name} /> -->
            <input class="input autocomplete" type="search" bind:value={newProduct.name} placeholder="Produkt-Name eingeben" use:popup={autocompletePopupSettings}/>
            <div class="card p-4" style="margin: 0px;" data-popup="popupAutocomplete">
                <Autocomplete bind:input={newProduct.name} options={addProductOptions} on:selection={onAddProductSelection} />
            </div>
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
            {#if inventoryItems.filter(item => item._id == product._id).length > 0}
                <div class="card p-2 my-2">
                    <span class="font-bold">{product.name} (x{inventoryItems.filter(item => item._id == product._id)[0].totalAmount}):</span>
                    <ul>
                        {#each inventoryItems.filter(item => item._id == product._id) as productInventory}
                            {#each productInventory.inventory as inventoryItem}
                                <li>
                                    {inventoryItem.expirationDate} (x{inventoryItem.amount})
                                    <button class="btn p-0 px-4 bg-red-500" on:click={setProductToRemove(product, inventoryItem)}>→</button>
                                </li>
                            {/each}
                        {/each}
                    </ul>
                </div>
            {/if}
        {/each}
    </div>

    <div class="card p-4 basis-1/4 flex-1 bg-red-50 border-red-300 border">
        <h2 class="h3">Produkt entnehmen</h2>
        <hr class="my-2" />
        {#if productToRemove.name == ""}
            <span class="text-center">Bitte wählen Sie links ein Produkt, um es entfernen zu können.</span>
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