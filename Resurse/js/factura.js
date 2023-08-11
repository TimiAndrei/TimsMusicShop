window.addEventListener("DOMContentLoaded", function () {
    let p = this.document.createElement("p");
    p.innerHTML = new Date() + " (generat automat) ";
    this.document.body.appendChild(p);
})