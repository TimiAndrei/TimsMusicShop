const express = require("express");
// require e ca un import din C (express e o biblioteca, dar e un fel de obiect)
const fs = require("fs"); // fs e biblioteca de file system
const path = require("path");
const sharp = require("sharp");

obGlobal = {
    obErori: null,
    obImagini: null
}; // obiect global


app = express();

console.log("Folder proiect: ", __dirname);
console.log("Cale fisier: ", __filename);
console.log("Director de lucru: ", process.cwd());

app.set("view engine", "ejs"); // motor de template 
// app.set trebuie pus inainte de get-uri 

app.use("/Resurse", express.static(__dirname + "/Resurse"));
// express.static e o functie care returneaza un obiect
// asa "livrez" resursele pentru site 

app.use(/^\/Resurse(\/[a-zA-Z0-9]*(?!\.)[a-zA-Z0-9]*)*$/, function (req, res) {
    afiseazaEroare(res, 403);
})

app.get("/favicon.ico", function (req, res) {
    res.sendFile(__dirname + "/Resurse/Imagini/favicon.ico");
});

// ejs e pentru a include cod html in alte fisiere html


app.get(["/index", "/", "/home"], function (req, res) {
    res.render("pagini/index", { ip: req.ip, a: 10, b: 20, imagini: obGlobal.obImagini.imagini });
}); //render - compileaza ejs-ul si il trimite catre client
// render stie ca e folosit pentru template, si se uita in views (folderul default)
app.get("/despre", function (req, res) {
    res.render("pagini/despre");
});
// app.get("/despre", function (req, res) {
//     res.render("pagini/despre");
// });

//app.get(/[a-zA-Z0-9]\.ejs$/) //regex pentru a verifica daca fisierele .ejs
app.get("/*.ejs", function (req, res) {//wildcard pentru a verifica daca fisierele .ejs

    afiseazaEroare(res, 400);
});

vectorFoldere = ["temp", "temp1"]

for (let folder of vectorFoldere) {
    // let cale_folder = __dirname + "/" + folder;
    let cale_folder = path.join(__dirname, folder);
    // console.log(cale_folder);
    if (!fs.existsSync(cale_folder))
        fs.mkdirSync(cale_folder);
} // creeaza folderele daca nu exista deja 

app.get("/*", function (req, res) {
    try {
        console.log(req.url);
        res.render("pagini" + req.url, function (err, rezRandare) {
            if (err) {
                if (err.message.startsWith("Failed to lookup view"))
                    // afiseazaEroare(res, { _identificator: 404, _titlu: "ceva" }); //trimit ca obiect
                    afiseazaEroare(res, 404); // trimit ca parametrii
                else
                    afiseazaEroare(res);
            }
            else {
                console.log(rezRandare);
                res.send(rezRandare);
            }
        });
    } catch (err) {
        if (err.message.startsWith("Cannot find module"))
            afiseazaEroare(res, 404);
    }
}); // path general pentru fiecare pagina si in caz de not found, send error


function initErori() {
    var continut = fs.readFileSync(__dirname + "/Resurse/json/erori.json").toString("utf-8"); // asteptam raspuns ( se pun intr-o coada de taskuri)
    //pentru functie asyncrona nu se asteapta raspuns 
    // console.log(continut);
    obGlobal.obErori = JSON.parse(continut);
    let vErori = obGlobal.obErori.info_erori;
    // for (let i = 0; i < vErori.length; i++) {
    //     console.log(vErori[i].imagine);
    // } o opriune de a parcurge vectorul, dar nu e cea mai buna

    for (let eroare of vErori) { //echivalent cu iteratorul din C++
        eroare.imagine = "/" + obGlobal.obErori.cale_baza + "/" + eroare.imagine;
        // eroare.imagine = path.join(obGlobal.obErori.cale_baza, eroare.imagine);
    }
}

initErori();
// #########################################################################
// function initImagini() {
//     var continut = fs.readFileSync(__dirname + "/Resurse/json/galerie.json").toString("utf-8");
//     obGlobal.obImagini = JSON.parse(continut);
//     let vImagini = obGlobal.obImagini.imagini;
//     let caleAbs = path.join(__dirname, obGlobal.obImagini.cale_baza);
//     let caleAbsMediu = path.join(caleAbs, "mediu");
//     if (!fs.existsSync(caleAbsMediu))
//         fs.mkdirSync(caleAbsMediu);
//     for (let imag of vImagini) { //echivalent cu iteratorul din C++
//         [numeFis, ext] = imag.nume.split(".");
//         imag.fisier_mediu = "/" + path.join(obGlobal.obImagini.cale_galerie, "mediu", numeFis + ".webp");
//         let caleAbsFisMediu = path.join(__dirname, imag.fisier_mediu);
//         sharp(path.join(caleAbs, imag.fisier)).resize(400).toFile(caleAbsFisMediu);

//         imag.fisier = "/" + path.join(obGlobal.obImagini.cale_galerie, imag.fisier);
//     }
// }

function initImagini() {
    var continut = fs.readFileSync(path.join(__dirname, "/resurse/json/galerie.json")).toString("utf-8");
    obGlobal.obImagini = JSON.parse(continut);
    let vImagini = obGlobal.obImagini.imagini;
    let caleAbs = path.join(__dirname, obGlobal.obImagini.cale_galerie);
    let caleAbsMediu = path.join(caleAbs, "mediu");

    if (!fs.existsSync(caleAbsMediu))
        fs.mkdirSync(caleAbsMediu);

    for (let imag of vImagini) {
        [nume_fisier, extensie] = imag.fisier.split(".");
        imag.fisier_mediu = "/" + path.join(obGlobal.obImagini.cale_galerie, "mediu", nume_fisier + "_mediu" + ".webp");
        let caleAbsFisMediu = path.join(__dirname, imag.fisier_mediu);
        sharp(path.join(caleAbs, imag.fisier)).resize(400).toFile(caleAbsFisMediu);

        imag.fisier = "/" + path.join(obGlobal.obImagini.cale_galerie, imag.fisier);
    }
}

initImagini();
//function afiseazaEroare(res, _identificator, _titlu =, _text, _imagine = {}) //trimitere ca obiect ( destructuring ) 
//name parameters mai sus, si mai jos parametrii default 
function afiseazaEroare(res, _identificator, _titlu = "titlu default", _text, _imagine) {
    let vErori = obGlobal.obErori.info_erori;
    let eroare = vErori.find(function (element) {
        return element.identificator === _identificator;
    });
    if (eroare) {
        let titlu = _titlu == "titlu default" ? (eroare.titlu || _titlu) : _titlu;
        // daca programatorul seteaza titlul, se ia titlul din argument,
        //daca nu e setat, se ia cel din json, 
        // daca nu avem titlu nici in json, se ia titlul din valoarea default 
        let text = _text || eroare.text;
        let imagine = _imagine || eroare.imagine;
        if (eroare.status) {
            res.status(eroare.identificator).render("pagini/eroare", { titlu: titlu, text: text, imagine: imagine });
        } else {
            res.render("pagini/eroare", { titlu: titlu, text: text, imagine: obGlobal.obErori.cale_baza = "/" + errDef.imagine });

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