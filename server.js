const express = require("express");
// require e ca un import din C (express e o biblioteca, dar e un fel de obiect)
const fs = require("fs"); // fs e biblioteca de file system

obGlobal = {
    obErori: null,
    obImagini: null
}; // obiect global


app = express();

app.set("view engine", "ejs"); // motor de template 
// app.set trebuie pus inainte de get-uri 

app.use("/Resurse", express.static(__dirname + "/Resurse"));
// express.static e o functie care returneaza un obiect
// asa "livrez" resursele pentru site 

// ejs e pentru a include cod html in alte fisiere html


app.get(["/index", "/", "/home"], function (req, res) {
    res.render("pagini/index", { ip: req.ip, a: 10, b: 20 });
}); //render - compileaza ejs-ul si il trimite catre client
// render stie ca e folosit pentru template, si se uita in views (folderul default)

// app.get("/despre", function (req, res) {
//     res.render("pagini/despre");
// });

app.get("/*", function (req, res) {
    console.log(req.url);
    res.render("pagini" + req.url, function (err, rezRandare) {
        if (err) {
            console.log(err);
            if (err.message.startsWith("Failed to lookup view"))
                afiseazaEroare(res, 404);
            else
                afiseazaEroare(res);
        }
        else {
            console.log(rezRandare);
            res.send(rezRandare);
        }
    });
}); // path general pentru fiecare pagina si in caz de not found, send error


function initErori() {
    var continut = fs.readFileSync(__dirname + "/Resurse/json/erori.json").toString("utf-8"); // asteptam raspuns ( se pun intr-o coada de taskuri)
    //pentru functie asyncrona nu se asteapta raspuns 
    console.log(continut);
    obGlobal.obErori = JSON.parse(continut);
    let vErori = obGlobal.obErori.info_erori;
    // for (let i = 0; i < vErori.length; i++) {
    //     console.log(vErori[i].imagine);
    // } o opriune de a parcurge vectorul, dar nu e cea mai buna

    for (let eroare of vErori) { //echivalent cu iteratorul din C++
        eroare.imagine = "/" + obGlobal.obErori.cale_baza + "/" + eroare.imagine;
    }
}

initErori();

function afiseazaEroare(res, _identificator, _titlu, _text, _imagine) {
    let vErori = obGlobal.obErori.info_erori;
    let eroare = vErori.find(function (element) {
        return element.identificator === _identificator;
    });
    if (eroare) {
        let titlu = _titlu || eroare.titlu;
        let text = _text || eroare.text;
        let imagine = _imagine || eroare.imagine;
        if (eroare.status) {
            res.status(eroare.identificator).render("pagini/eroare", { titlu: titlu, text: text, imagine: imagine });
        } else {
            res.render("pagini/eroare", { titlu: titlu, text: text, imagine: imagine });
        }
    }
    else {
        let errDef = obGlobal.obErori.eroare_default;
        res.render("pagini/eroare", { titlu: errDef.titlu, text: errDef.text, imagine: errDef.imagine });
    }
}

app.listen(8080); // portul pe care asculta serverul

console.log("Serverul a pornit !");

//video si web-vtt de citit 