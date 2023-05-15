window.addEventListener("DOMContentLoaded", function () {

    document.getElementById("inp-pret").onchange = function () {
        document.getElementById("infoRange").innerHTML = `(${this.value})`;
    }

    document.getElementById("filtrare").onclick = function () {
        // inputuri
        let val_nume = document.getElementById("inp-nume").value.toLowerCase();

        let greutate = document.getElementsByName("gr_rad");

        let val_greutate;
        for (let r of greutate) {
            if (r.checked) {
                val_greutate = r.value;
            }
        }

        if (val_greutate != "toate") {
            [greutate_min, greutate_max] = val_greutate.split(":");
            var greutate_min = parseInt(greutate_min);
            var greutate_max = parseInt(greutate_max);
        }

        let val_pret = document.getElementById("inp-pret").value;

        let val_categorie = document.getElementById("inp-categorie").value;

        var produse = document.getElementsByClassName("produs");


        for (let prod of produse) {
            prod.style.display = "none";

            // valori din produs
            let nume = prod.getElementsByClassName("val-nume")[0].innerHTML.toLowerCase();
            let cond1 = (nume.startsWith(val_nume));

            let prod_greutate = parseInt(prod.getElementsByClassName("val-greutate")[0].innerHTML);
            let cond2 = (val_greutate == "toate" || greutate_min <= prod_greutate && prod_greutate < greutate_max);

            let prod_pret = parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML);
            let cond3 = (val_pret <= prod_pret);

            let prod_categorie = prod.getElementsByClassName("val-categorie")[0].innerHTML;
            let cond4 = (val_categorie == "toate" || val_categorie == prod_categorie);

            if (cond1 && cond2 && cond3 && cond4)
                prod.style.display = "block";

        }
    }

    document.getElementById("resetare").onclick = function () {

        document.getElementById("inp-nume").value = "";

        document.getElementById("inp-pret").value = document.getElementById("inp-pret").min;
        document.getElementById("inp-categorie").value = "toate";
        document.getElementById("i_rad4").checked = true;
        var produse = document.getElementsByClassName("produs");

        for (let prod of produse) {
            prod.style.display = "block";
        }
    }

    function sortare(semn) {
        var produse = document.getElementsByClassName("produs");
        var v_produse = Array.from(produse);

        v_produse.sort(function (a, b) {
            var pret_a = parseFloat(a.getElementsByClassName("val-pret")[0].innerHTML);
            var pret_b = parseFloat(b.getElementsByClassName("val-pret")[0].innerHTML);
            if (pret_a == pret_b) {
                var nume_a = a.getElementsByClassName("val-nume")[0].innerHTML;
                var nume_b = b.getElementsByClassName("val-nume")[0].innerHTML;
                return semn * nume_a.localeCompare(nume_b);
            }
            return semn * (pret_a - pret_b);
        })

        for (let prod of v_produse) {
            prod.parentElement.appendChild(prod);
        }

    }

    document.getElementById("sortCrescNume").onclick = function () {
        sortare(1)
    }
    document.getElementById("sortDescrescNume").onclick = function () {
        sortare(-1)
    }

    window.onkeydown = function (e) {
        if (e.key == "c" && e.altKey) {
            if (document.getElementById("info-suma"))
                return;
            var produse = document.getElementsByClassName("produs");
            let suma = 0;
            for (let prod of produse) {
                if (prod.style.display != "none") {
                    let pret = parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML);
                    suma += pret;
                }
            }
            let p = document.createElement("p");
            p.innerHTML = suma;
            p.id = "info-suma";
            ps = document.getElementById("p-suma");
            container = ps.parentNode;
            frate = ps.nextElementSibling;
            container.insertBefore(p, frate); // ca sa punem dupa container 
            setTimeout(function () {
                let info = document.getElementById("info-suma");
                if (info)
                    info.remove();
            }, 1000)
        }
    }


});