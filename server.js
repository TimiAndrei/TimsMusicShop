const express = require("express");
// require e ca un import din C (express e o biblioteca, dar e un fel de obiect)
const fs = require("fs"); // fs e biblioteca de file system
const path = require("path");
const sharp = require("sharp");
const sass = require("sass");
const { Client } = require("pg"); //destructuring
const { randomInt } = require("crypto");

var client = new Client({
    database: "musicshopdb",
    user: "timi",
    password: "pa55word",
    host: "localhost",
    port: 5432,
});
client.connect();

obGlobal = {
    obErori: null,
    obImagini: null,
    folderScss: path.join(__dirname, "Resurse", "scss"),
    folderCss: path.join(__dirname, "Resurse", "css"),
    folderBackup: path.join(__dirname, "Resurse/backup"),
    optiuniMeniu: []
}; // obiect global

client.query("select * from unnest(enum_range(null::tipuri_produse))", function (err, rezTip) {
    if (err)
        console.log(err);
    else
        obGlobal.optiuniMeniu = rezTip.rows;
});


app = express();

// console.log("Folder proiect: ", __dirname);
// console.log("Cale fisier: ", __filename);
// console.log("Director de lucru: ", process.cwd());

app.set("view engine", "ejs"); // motor de template 
// app.set trebuie pus inainte de get-uri 

app.use("/Resurse", express.static(__dirname + "/Resurse"));
// express.static e o functie care returneaza un obiect
// asa "livrez" resursele pentru site 
app.use("/*", function (req, res, next) {
    res.locals.optiuniMeniu = obGlobal.optiuniMeniu;
    next();
});

app.use("/node_modules", express.static(__dirname + "/node_modules"));
app.use(/^\/Resurse(\/[a-zA-Z0-9]*(?!\.)[a-zA-Z0-9]*)*$/, function (req, res) {
    afiseazaEroare(res, 403);
})


app.get("/favicon.ico", function (req, res) {
    res.sendFile(__dirname + "/Resurse/Imagini/favicon.ico");
});

// ejs e pentru a include cod html in alte fisiere html

app.get(["/index", "/", "/home", "/acasa"], function (req, res) {
    res.render("pagini/index", { ip: req.ip, a: 10, b: 20, imagini: obGlobal.obImagini.imagini });
}); //render - compileaza ejs-ul si il trimite catre client
// render stie ca e folosit pentru template, si se uita in views (folderul default)
app.get("/despre", function (req, res) {
    res.render("pagini/despre");
});

app.get("/galerie_animata", function (req, res) {
    let nrImagini = randomInt(6, 12);
    if (nrImagini % 2 != 0)
        nrImagini++;

    let fisScss = path.join(__dirname, "Resurse/scss/galerie_animata.scss");
    let liniiFisScss = fs.readFileSync(fisScss).toString().split('\n');

    let stringImg = "$nrImg: " + nrImagini + ";";
    liniiFisScss.shift();
    liniiFisScss.unshift(stringImg);
    fs.writeFileSync(fisScss, liniiFisScss.join('\n'))

    res.render("pagini/galerie_animata", { imagini: obGlobal.obImagini.imagini, nrImagini: nrImagini });
});

app.get("/produse", function (req, res) {

    client.query("select * from unnest(enum_range(null::categ_instrument))", function (err, rezCategorie) {
        if (err) {
            console.log(err);
            afiseazaEroare(res, 2);
        }
        else {
            let conditieWhere = "";
            if (req.query.tip)
                conditieWhere = ` WHERE tip_instrument='${req.query.tip}'`;
            client.query("SELECT * from instrumente" + conditieWhere, function (err, rez) {

                if (err) {
                    console.log(err);
                    afiseazaEroare(res, 2);
                }
                else
                    res.render("pagini/produse", { produse: rez.rows, optiuni: rezCategorie.rows });
            });
        }
    });


});

app.get("/produs/:id", function (req, res) {
    console.log(req.params);

    client.query(`SELECT * FROM instrumente WHERE id=${req.params.id}`, function (err, rezultat) {
        if (err) {
            console.log(err);
            afiseazaEroare(res, 2);
        }
        else
            res.render("pagini/produs", { prod: rezultat.rows[0] });
    });
});
//app.get(/[a-zA-Z0-9]\.ejs$/) //regex pentru a verifica daca fisierele .ejs
app.get("/*.ejs", function (req, res) {//wildcard pentru a verifica daca fisierele .ejs

    afiseazaEroare(res, 400);
});

app.get("/*", function (req, res) {
    try {
        // console.log(req.url);
        res.render("pagini" + req.url, function (err, rezRandare) {
            if (err) {
                if (err.message.startsWith("Failed to lookup view"))
                    // afiseazaEroare(res, { _identificator: 404, _titlu: "ceva" }); //trimit ca obiect
                    afiseazaEroare(res, 404); // trimit ca parametrii
                else
                    afiseazaEroare(res);
            }
            else {
                //console.log(rezRandare);
                res.send(rezRandare);
            }
        });
    } catch (err) {
        if (err.message.startsWith("Cannot find module"))
            afiseazaEroare(res, 404);
    }
}); // path general pentru fiecare pagina si in caz de not found, send error

vectorFoldere = ["temp", "temp1", "backup"]

for (let folder of vectorFoldere) {
    // let cale_folder = __dirname + "/" + folder;
    let cale_folder = path.join(__dirname, folder);
    // console.log(cale_folder);
    if (!fs.existsSync(cale_folder))
        fs.mkdirSync(cale_folder);
} // creeaza folderele daca nu exista deja 

function compileazaCss(caleScss, caleCss) {
    if (!caleCss) {
        // let vectorCale = caleScss.split("\\");
        // let numeFisierExtensie = vectorCale[vectorCale.length - 1];
        let numeFisierExtensie = path.basename(caleScss);
        let numeFisier = numeFisierExtensie.split(".")[0]; // a.scss->[("a"), ("scss")]
        caleCss = numeFisier + ".css";
    }
    if (!path.isAbsolute(caleScss))
        caleScss = path.join(obGlobal.folderScss, caleScss);
    if (!path.isAbsolute(caleCss))
        caleCss = path.join(obGlobal.folderCss, caleCss);

    let caleBackup = path.join(obGlobal.folderBackup, "/Resurse/css");
    if (!fs.existsSync(caleBackup)) {
        fs.mkdirSync(caleBackup, { recursive: true });//pentru ca nu e creat la prima rulare css, deci mai ruleaza o data
    }

    let numeFisCss = path.basename(caleScss);
    if (fs.existsSync(caleCss)) {
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, numeFisCss));
    }
    rez = sass.compile(caleScss, { "sourceMap": true });
    fs.writeFileSync(caleCss, rez.css);
    // console.log("Compilare css: ", rez);

}


vFisiere = fs.readdirSync(obGlobal.folderScss); //da vector de stringuri cu numele fisierelor
for (let numeFis of vFisiere) {
    if (path.extname(numeFis) == ".scss")
        compileazaCss(numeFis);
}

fs.watch(obGlobal.folderScss, function (eveniment, numeFis) {
    // console.log(eveniment, numeFis);
    if (eveniment == "change" || eveniment == "rename") {
        let caleCompleta = path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta))
            compileazaCss(caleCompleta);
    }
})


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

function initImagini() {
    var continut = fs.readFileSync(path.join(__dirname, "/Resurse/json/galerie.json")).toString("utf-8");
    obGlobal.obImagini = JSON.parse(continut);
    let vImagini = obGlobal.obImagini.imagini;
    let caleAbs = path.join(__dirname, obGlobal.obImagini.cale_galerie);
    let caleAbsMediu = path.join(caleAbs, "mediu");
    let caleAbsMare = path.join(caleAbs, "mare");
    let caleAbsMic = path.join(caleAbs, "mic");

    if (!fs.existsSync(caleAbsMediu))
        fs.mkdirSync(caleAbsMediu);

    if (!fs.existsSync(caleAbsMare))
        fs.mkdirSync(caleAbsMare);

    if (!fs.existsSync(caleAbsMic))
        fs.mkdirSync(caleAbsMic);

    for (let imag of vImagini) {
        [nume_fisier, extensie] = imag.fisier.split(".");
        imag.fisier_mediu = path.join(obGlobal.obImagini.cale_galerie, "mediu", nume_fisier + "_mediu" + ".webp");
        imag.fisier_mic = path.join(obGlobal.obImagini.cale_galerie, "mic", nume_fisier + "_mic" + ".webp");
        imag.fisier_mare = path.join(obGlobal.obImagini.cale_galerie, "mare", nume_fisier + "_mare" + ".webp");
        let caleAbsFisMediu = path.join(__dirname, imag.fisier_mediu);
        let caleAbsFisMare = path.join(__dirname, imag.fisier_mare);
        let caleAbsFisMic = path.join(__dirname, imag.fisier_mic);
        let caleProduse = path.join(__dirname, "Resurse", "Imagini", "produse", "processed", nume_fisier + ".jpg")
        sharp(path.join(caleAbs, imag.fisier)).resize(600, 500, { fit: 'contain' }).toFile(caleAbsFisMare);
        sharp(path.join(caleAbs, imag.fisier)).resize(400, 300, { fit: 'contain' }).toFile(caleAbsFisMediu);
        sharp(path.join(caleAbs, imag.fisier)).resize(300, 300, { fit: 'contain' }).toFile(caleAbsFisMic);
        sharp(path.join(caleAbs, imag.fisier)).resize(600, 500, { fit: 'contain' }).toFile(caleProduse);
        imag.fisier = path.join(obGlobal.obImagini.cale_galerie, imag.fisier);
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
            let errDef = obGlobal.obErori.eroare_default;
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