const express = require("express");
const fs = require("fs"); // fs e biblioteca de file system
const path = require("path");
const sharp = require("sharp");
const sass = require("sass");
const { Client } = require("pg"); //destructuring
const { randomInt } = require("crypto");

const formidable = require("formidable");
const { Utilizator } = require("./module_proprii/utilizator.js")
const session = require('express-session');
const Drepturi = require("./module_proprii/drepturi.js");

const AccesBD = require("./module_proprii/accesbd.js");

const QRCode = require('qrcode');
const puppeteer = require('puppeteer');
const mongodb = require('mongodb');
const helmet = require('helmet');
const xmljs = require('xml-js');

const request = require("request");

// AccesBD.getInstanta().select(
//     {
//         tabel: "instrumente",
//         campuri: ["nume", "pret", "categorie"],
//         conditiiAnd: ["pret>1000"]
//     },
//     function (err, rez) {
//         console.log(err);
//         console.log(rez);
//     }
// )

AccesBD.getInstanta()

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
    optiuniMeniu: [],
    protocol: "http://",
    numeDomeniu: "localhost:8080"
    // clientMongo: mongodb.MongoClient,
    // bdMongo: null
}; // obiect global


// var url = "mongodb://localhost:27017";//pentru versiuni mai vechi de Node
// var url = "mongodb://0.0.0.0:27017";

// obGlobal.clientMongo.connect(url, function (err, bd) {
//     if (err) console.log(err);
//     else {
//         obGlobal.bdMongo = bd.db("proiect_web");
//     }
// });


client.query("select * from unnest(enum_range(null::categ_instrument))", function (err, rezTip) {
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

app.use((req, res, next) => {
    let currentPage = req.path.split('/').pop().split('.')[0];
    res.locals.currentPage = currentPage;
    next();
});

app.use("/Resurse", express.static(__dirname + "/Resurse"));
// express.static e o functie care returneaza un obiect
// asa "livrez" resursele pentru site 

app.use("/node_modules", express.static(__dirname + "/node_modules"));
app.use(/^\/Resurse(\/[a-zA-Z0-9]*(?!\.)[a-zA-Z0-9]*)*$/, function (req, res) {
    afiseazaEroare(res, 403);
})

app.use(session({ // aici se creeaza proprietatea session a requestului (pot folosi req.session)
    secret: 'abcdefg',//folosit de express session pentru criptarea id-ului de sesiune
    resave: true,
    saveUninitialized: false
}));

app.use("/*", function (req, res, next) {
    res.locals.optiuniMeniu = obGlobal.optiuniMeniu;
    res.locals.Drepturi = Drepturi;
    if (req.session.utilizator) {
        req.utilizator = res.locals.utilizator = new Utilizator(req.session.utilizator);
    }
    next();
});

app.use(["/produse_cos", "/cumpara"], express.json({ limit: '2mb' }));//obligatoriu de setat pt request body de tip json


app.get("/favicon.ico", function (req, res) {
    res.sendFile(__dirname + "/Resurse/Imagini/favicon.ico");
});

// ejs e pentru a include cod html in alte fisiere html

app.get(["/index", "/", "/home", "/login"], async function (req, res) {
    let sir = req.session.mesajLogin;
    req.session.succesLogin = null;

    res.render("pagini/index", { ip: req.ip, a: 10, b: 20, imagini: obGlobal.obImagini.imagini, mesajLogin: sir });
}); //render - compileaza ejs-ul si il trimite catre client
// render stie ca e folosit pentru template, si se uita in views (folderul default)
app.get("/despre", function (req, res) {
    res.render("pagini/despre");
});

app.get("/logout", function (req, res) {
    req.session.destroy();
    res.locals.utilizator = null;
    res.render("pagini/logout");
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

app.post("/produse_cos", function (req, res) {
    console.log(req.body);
    if (req.body.ids_prod.length != 0) {
        AccesBD.getInstanta().select({ tabel: "instrumente", campuri: "nume,descriere,pret,materiale,imagine, ".split(","), conditiiAnd: [`id in (${req.body.ids_prod})`] },
            function (err, rez) {
                if (err)
                    res.send([]);
                else
                    res.send(rez.rows);
            });
    }
    else {
        res.send([]);
    }

});


cale_qr = __dirname + "/resurse/imagini/qrcode";
if (fs.existsSync(cale_qr))
    fs.rmSync(cale_qr, { force: true, recursive: true });
fs.mkdirSync(cale_qr);
client.query("select id from instrumente", function (err, rez) {
    for (let prod of rez.rows) {
        let cale_prod = obGlobal.protocol + obGlobal.numeDomeniu + "/produs/" + prod.id;
        //console.log(cale_prod);
        QRCode.toFile(cale_qr + "/" + prod.id + ".png", cale_prod);
    }
});

async function genereazaPdf(stringHTML, numeFis, callback) {
    const chrome = await puppeteer.launch();
    const document = await chrome.newPage();
    console.log("inainte load")
    await document.setContent(stringHTML, { waitUntil: "load" });

    console.log("dupa load")
    await document.pdf({ path: numeFis, format: 'A4' });
    await chrome.close();
    if (callback)
        callback(numeFis);
}

app.post("/cumpara", function (req, res) {
    console.log(req.body);
    console.log("Utilizator:", req?.utilizator);
    console.log("Utilizator:", req?.utilizator?.rol?.areDreptul?.(Drepturi.cumparareProduse));
    console.log("Drept:", req?.utilizator?.areDreptul?.(Drepturi.cumparareProduse));
    if (req?.utilizator?.areDreptul?.(Drepturi.cumparareProduse)) {
        AccesBD.getInstanta().select({
            tabel: "instrumente",
            campuri: ["*"],
            conditiiAnd: [`id in (${req.body.ids_prod})`]
        }, function (err, rez) {
            if (!err && rez.rowCount > 0) {
                console.log("produse:", rez.rows);
                let rezFactura = ejs.render(fs.readFileSync("./views/pagini/factura.ejs").toString("utf-8"), {
                    protocol: obGlobal.protocol,
                    domeniu: obGlobal.numeDomeniu,
                    utilizator: req.session.utilizator,
                    produse: rez.rows
                });
                console.log(rezFactura);
                let numeFis = `./temp/factura${(new Date()).getTime()}.pdf`;
                genereazaPdf(rezFactura, numeFis, function (numeFis) {
                    mesajText = `Stimate ${req.session.utilizator.username} aveti mai jos rezFactura.`;
                    mesajHTML = `<h2>Stimate ${req.session.utilizator.username},</h2> aveti mai jos rezFactura.`;
                    req.utilizator.trimiteMail("Factura", mesajText, mesajHTML, [{
                        filename: "factura.pdf",
                        content: fs.readFileSync(numeFis)
                    }]);
                    res.send("Totul e bine!");
                });
                rez.rows.forEach(function (elem) { elem.cantitate = 1 });
                let jsonFactura = {
                    data: new Date(),
                    username: req.session.utilizator.username,
                    produse: rez.rows
                }
                if (obGlobal.bdMongo) {
                    obGlobal.bdMongo.collection("facturi").insertOne(jsonFactura, function (err, rezmongo) {
                        if (err) console.log(err)
                        else console.log("Am inserat factura in mongodb");

                        obGlobal.bdMongo.collection("facturi").find({}).toArray(
                            function (err, rezInserare) {
                                if (err) console.log(err)
                                else console.log(rezInserare);
                            })
                    })
                }
            }
        })
    }
    else {
        res.send("Nu puteti cumpara daca nu sunteti logat sau nu aveti dreptul!");
    }

});

app.get("/grafice", function (req, res) {
    if (!(req?.session?.utilizator && req.utilizator.areDreptul(Drepturi.vizualizareGrafice))) {
        afisEroare(res, 403);
        return;
    }
    res.render("pagini/grafice");

})

app.get("/update_grafice", function (req, res) {
    obGlobal.bdMongo.collection("facturi").find({}).toArray(function (err, rezultat) {
        res.send(JSON.stringify(rezultat));
    });
})

app.get("/produse", function (req, res) {
    client.query(
        "SELECT * FROM unnest(enum_range(null::categ_instrument))",
        function (err, rezCategorie) {
            if (err) {
                console.log(err);
                afiseazaEroare(res, 2);
            } else {
                let conditieWhere = "";
                if (req.query.categorie) {
                    conditieWhere = ` WHERE categorie='${req.query.categorie}'`;
                }
                client.query(
                    "SELECT * FROM instrumente" + conditieWhere,
                    function (err, rez) {
                        if (err) {
                            console.log(err);
                            afiseazaEroare(res, 2);
                        } else {
                            client.query(
                                "SELECT MIN(pret) AS min_price, MAX(pret) AS max_price FROM instrumente",
                                function (err, rezPret) {
                                    if (err) {
                                        console.log(err);
                                        afiseazaEroare(res, 2);
                                    } else {
                                        client.query(
                                            "SELECT distinct(unnest(material)) FROM instrumente",
                                            function (err, rezMaterial) {
                                                if (err) {
                                                    console.log(err);
                                                    afiseazaEroare(res, 2);
                                                } else {
                                                    client.query(
                                                        "SELECT * FROM unnest(enum_range(null::tipuri_instrument))",
                                                        function (err, rezTip) {
                                                            if (err) {
                                                                console.log(err);
                                                                afiseazaEroare(res, 2);
                                                            } else {
                                                                res.render("pagini/produse", {
                                                                    produse: rez.rows,
                                                                    optiuni: rezCategorie.rows,
                                                                    minPrice: rezPret.rows[0].min_price,
                                                                    maxPrice: rezPret.rows[0].max_price,
                                                                    material: rezMaterial.rows.map((row) => row.unnest),
                                                                    tipuri: rezTip.rows,
                                                                });
                                                            }
                                                        }
                                                    );
                                                }
                                            }
                                        );
                                    }
                                }
                            );
                        }
                    }
                );
            }
        }
    );
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

app.get("/useri", function (req, res) {

    if (req?.utilizator?.areDreptul?.(Drepturi.vizualizareUtilizatori)) {
        AccesBD.getInstanta().select({ tabel: "utilizatori", campuri: ["*"] }, function (err, rezQuery) {
            console.log(err);
            res.render("pagini/useri", { useri: rezQuery.rows });
        });
    }
    else {
        afisareEroare(res, 403);
    }
});


app.post("/sterge_utiliz", function (req, res) {
    if (req?.utilizator?.areDreptul?.(Drepturi.stergereUtilizatori)) {
        var formular = new formidable.IncomingForm();

        formular.parse(req, function (err, campuriText, campuriFile) {

            AccesBD.getInstanta().delete({ tabel: "utilizatori", conditiiAnd: [`id=${campuriText.id_utiliz}`] }, function (err, rezQuery) {
                console.log(err);
                res.redirect("/useri");
            });
        });
    } else {
        afisareEroare(res, 403);
    }
})

vectorFoldere = ["temp", "temp1", "backup", "poze_uploadate"]

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

app.post("/sterge_utiliz", function (req, res) {
    if (req?.utilizator?.areDreptul?.(Drepturi.stergereUtilizatori)) {
        var formular = new formidable.IncomingForm();

        formular.parse(req, function (err, campuriText, campuriFile) {

            AccesBD.getInstanta().delete({ tabel: "utilizatori", conditiiAnd: [`id=${campuriText.id_utiliz}`] }, function (err, rezQuery) {
                console.log(err);
                res.redirect("/useri");
            });
        });
    } else {
        afisareEroare(res, 403);
    }
})

app.post("/inregistrare", function (req, res) {
    var username;
    var poza;
    console.log("ceva");
    var formular = new formidable.IncomingForm()
    formular.parse(req, function (err, campuriText, campuriFisier) {//4
        console.log("Inregistrare:", campuriText);

        console.log(campuriFisier);
        var eroare = "";

        var utilizNou = new Utilizator();
        try {
            utilizNou.setareNume = campuriText.nume;
            utilizNou.setareUsername = campuriText.username;
            utilizNou.email = campuriText.email
            utilizNou.prenume = campuriText.prenume

            utilizNou.parola = campuriText.parola;
            utilizNou.culoare_chat = campuriText.culoare_chat;
            utilizNou.poza = poza;
            Utilizator.getUtilizDupaUsername(campuriText.username, {}, function (u, parametru, eroareUser) {
                if (eroareUser == -1) {//nu exista username-ul in BD
                    utilizNou.salvareUtilizator();
                }
                else {
                    eroare += "Mai exista username-ul";
                }

                if (!eroare) {
                    res.render("pagini/inregistrare", { raspuns: "Inregistrare cu succes!" })

                }
                else
                    res.render("pagini/inregistrare", { err: "Eroare: " + eroare });
            })


        }
        catch (e) {
            console.log(e);
            eroare += "Eroare site; reveniti mai tarziu";
            console.log(eroare);
            res.render("pagini/inregistrare", { err: "Eroare: " + eroare })
        }




    });
    formular.on("field", function (nume, val) {  // 1 

        console.log(`--- ${nume}=${val}`);

        if (nume == "username")
            username = val;
    })
    formular.on("fileBegin", function (nume, fisier) { //2
        console.log("fileBegin");

        console.log(nume, fisier);
        //TO DO in folderul poze_uploadate facem folder cu numele utilizatorului
        let folderUser = path.join(__dirname, "poze_uploadate", username);
        //folderUser=__dirname+"/poze_uploadate/"+username
        console.log(folderUser);
        if (!fs.existsSync(folderUser))
            fs.mkdirSync(folderUser);
        fisier.filepath = path.join(folderUser, fisier.originalFilename)
        poza = fisier.originalFilename
        //fisier.filepath=folderUser+"/"+fisier.originalFilename

    })
    formular.on("file", function (nume, fisier) {//3
        console.log("file");
        console.log(nume, fisier);
    });
});

app.post("/profil", function (req, res) {
    console.log("profil");
    if (!req.session.utilizator) {
        afiseazaEroare(res, 403)
        res.render("pagini/eroare_generala", { text: "Nu sunteti logat." });
        return;
    }
    var formular = new formidable.IncomingForm();

    formular.parse(req, function (err, campuriText, campuriFile) {

        var parolaCriptata = Utilizator.criptareParola(campuriText.parola);
        // AccesBD.getInstanta().update(
        //     {tabel:"utilizatori",
        //     campuri:["nume","prenume","email","culoare_chat"],
        //     valori:[`${campuriText.nume}`,`${campuriText.prenume}`,`${campuriText.email}`,`${campuriText.culoare_chat}`],
        //     conditiiAnd:[`parola='${parolaCriptata}'`]
        // },  
        AccesBD.getInstanta().updateParametrizat(
            {
                tabel: "utilizatori",
                campuri: ["nume", "prenume", "email", "culoare_chat"],
                valori: [`${campuriText.nume}`, `${campuriText.prenume}`, `${campuriText.email}`, `${campuriText.culoare_chat}`],
                conditiiAnd: [`parola='${parolaCriptata}'`, `username= '${campuriText.username}'`]
            },
            function (err, rez) {
                if (err) {
                    console.log(err);
                    afiseazaEroare(res, 2);
                    return;
                }
                console.log(rez.rowCount);
                if (rez.rowCount == 0) {
                    res.render("pagini/profil", { mesaj: "Update-ul nu s-a realizat. Verificati parola introdusa." });
                    return;
                }
                else {
                    //actualizare sesiune
                    console.log("ceva");
                    req.session.utilizator.nume = campuriText.nume;
                    req.session.utilizator.prenume = campuriText.prenume;
                    req.session.utilizator.email = campuriText.email;
                    req.session.utilizator.culoare_chat = campuriText.culoare_chat;
                    res.locals.utilizator = req.session.utilizator;
                }


                res.render("pagini/profil", { mesaj: "Update-ul s-a realizat cu succes." });

            });


    });
});

app.get("/cod/:username/:token", function (req, res) {
    console.log(req.params);
    try {
        Utilizator.getUtilizDupaUsername(req.params.username, { res: res, token: req.params.token }, function (u, obparam) {
            AccesBD.getInstanta().update(
                {
                    tabel: "utilizatori",
                    campuri: { confirmat_mail: 'true' },
                    conditiiAnd: [`cod='${obparam.token}'`]
                },
                function (err, rezUpdate) {
                    if (err || rezUpdate.rowCount == 0) {
                        console.log("Cod:", err);
                        afisareEroare(res, 3);
                    }
                    else {
                        res.render("pagini/confirmare.ejs");
                    }
                })
        })
    }
    catch (e) {
        console.log(e);
        renderError(res, 2);
    }
})

app.post("/login", function (req, res) {
    var username;
    console.log("ceva");
    var formular = new formidable.IncomingForm()
    formular.parse(req, function (err, campuriText, campuriFisier) {
        Utilizator.getUtilizDupaUsername(campuriText.username, {
            req: req,
            res: res,
            parola: campuriText.parola
        }, function (u, obparam) {
            let parolaCriptata = Utilizator.criptareParola(obparam.parola);
            if (u.parola == parolaCriptata && u.confirmat_mail) {
                u.poza = u.poza ? path.join("poze_uploadate", u.username, u.poza) : "";
                obparam.req.session.utilizator = u;

                obparam.req.session.mesajLogin = "Bravo! Te-ai logat!";
                obparam.res.redirect("/index");
                //obparam.res.render("/login");
            }
            else {
                console.log("Eroare logare")
                obparam.req.session.mesajLogin = "Date logare incorecte sau nu a fost confirmat mailul!";
                obparam.res.redirect("/index");
            }
        })
    });
});

app.get("/*.ejs", function (req, res) {//wildcard pentru a verifica daca fisierele .ejs

    afiseazaEroare(res, 400);
});

app.get("/*", function (req, res) {
    try {
        // console.log(req.url);
        res.render("pagini" + req.url, function (err, rezRandare) {
            console.log(err)
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

app.listen(8080); // portul pe care asculta serverul

console.log("Serverul a pornit !");

//video si web-vtt de citit 