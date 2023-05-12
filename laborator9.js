a = 11;

function f() {
    alert(1);
}

window.onload = function () {
    document.getElementById("abc").innerHTML = "Hello World!";

    let v = document.getElementsByClassName("pgf");
    console.log(v.length);

    document.getElementsByTagName("button")[0].onclick = function () { //[0] pentru ca am doar un singur buton 
        document.getElementById("abc").style.backgroundColor = "red";
        alert(2);
    };

    document.getElementById("adauga").onclick = function () {
        var p = document.createElement("p");
        p.innerHTML = "Paragraf nou";
        document.body.appendChild(p);
        // document.body.insertBefore(p, document.getElementById("adauga"));
        // document.body.insertBefore(p, this);
        // document.body.appendChild(document.getElementById("de_mutat")); muta elementul cu id-ul de_mutat
    }

    document.getElementById("sterge").onclick = function () {
        let paragraf = document.getElementsByTagName("p");
        if (paragraf.length) {
            let ultimul_paragraf = paragraf[paragraf.length - 1];
            ultimul_paragraf.remove();
        }

    }
}
