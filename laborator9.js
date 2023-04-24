a = 11;

function f() {
    alert(1);
}

window.onload = function () {
    document.getElementById("abc").innerHTML = "Hello World!";

    let v = document.getElementsByClassName("pgf");
    console.log(v.length);

    document.getElementsByTagName("button")[0].onclick = function () {
        document.getElementById("abc").style.backgroundColor = "red";
        alert(2);
    }//[0] pentru ca am doar un singur buton 
}
