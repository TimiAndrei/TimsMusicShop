window.addEventListener("DOMContentLoaded", function () {
    // Get the virtual cart modal
    let modal = document.getElementById("cosModal");
    let modalBody = modal.querySelector(".modal-body");

    // Get the product ids from the virtual cart
    let iduriProduse = localStorage.getItem("cos_virtual");
    iduriProduse = iduriProduse ? iduriProduse.split(",") : [];

    // Loop through the product ids and load the product page content
    for (let id of iduriProduse) {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", `/produse`, true);
        xhr.onload = function () {
            if (xhr.status == 200) {
                // Create a temporary div element to hold the loaded content
                let tempDiv = document.createElement("div");
                tempDiv.innerHTML = xhr.responseText;

                // Get the product article from the loaded content
                let produs = tempDiv.querySelector(`#ar_ent_${id}`);

                // Add the product article to the modal body
                modalBody.append(produs);

                // Hide the "selecteaza-cos" label
                let selecteazaCosLabel = produs.querySelector(".selecteaza-cos");
                selecteazaCosLabel.style.display = "none";
            }
        };
        xhr.send();
    }

    let reset_cos = document.getElementById("reset_cos");

    reset_cos.onclick = function () {
        localStorage.removeItem("cos_virtual");
        location.reload();
    }
});