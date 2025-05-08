const http = require('http'); // Importer http-modulen for å lage en HTTP-server
const fs = require('fs'); // Importer fs-modulen for å håndtere filsystemet, hva er fs modulen? FS står for File System og brukes til å lese og skrive filer i Node.js.
// FS-modulen gir oss muligheten til å jobbe med filer og kataloger på serveren, som å lese, skrive, slette og oppdatere filer.
const url = require('url'); // Importer url-modulen for å håndtere URL-er og forespørselparametere, 
// URL-modulen gir oss muligheten til å analysere og manipulere URL-er, som å hente forespørselparametere og håndtere ruter i serveren.
const path = require('path'); // Importer path-modulen for å håndtere filstier,
// Path-modulen gir oss muligheten til å jobbe med filstier på en plattformuavhengig måte, som å lage absolutte stier og håndtere filnavn og utvidelser.

const DATA_FILE = 'elever.json'; // Definerer konstanten DATA_FILE som peker til filen der elevdataene lagres.
function lesData() { // Funksjon for å lese data fra JSON-filen
    // Denne funksjonen leser innholdet i filen og returnerer det som et JavaScript-objekt.
    if (!fs.existsSync(DATA_FILE)) return [];
    const data = fs.readFileSync(DATA_FILE);
    return JSON.parse(data);
}

function skrivData(data) { // Funksjon for å skrive data til JSON-filen
    // Denne funksjonen tar et JavaScript-objekt og skriver det til filen i JSON-format.
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2)); // JSON.stringify konverterer JavaScript-objektet til en JSON-streng, og null, 2 formaterer det med 2 mellomrom for bedre lesbarhet.
}


const server = http.createServer((req, res) => {    // Oppretter en HTTP-server som håndterer forespørslene
    const parsedUrl = url.parse(req.url, true); // Parserer URL-en for å hente forespørselparametere og ruteinformasjon
    const method = req.method; // Henter HTTP-metoden fra forespørselen (GET, POST, PUT, DELETE)
    const pathname = parsedUrl.pathname; // Henter stien fra den analyserte URL-en

    res.setHeader('Access-Control-Allow-Origin', '*');  // Setter CORS-header for å tillate forespørsel fra alle opprinnelser
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');    // Setter CORS-header for å tillate spesifikke HTTP-metoder
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');   // Setter CORS-header for å tillate spesifikke forespørselshoder
// feilbehandling for CORS
    if (method === 'OPTIONS') { // Håndterer preflight forespørsel for CORS
        res.writeHead(204); // Sender en 204 No Content-respons for OPTIONS-forespørselen
        return res.end(); // Avslutter forespørselen uten å sende noe innhold
    }

    if (pathname === '/') { // Håndterer forespørselen til rotstien
        const filePath = path.join(__dirname, 'index.html');    // Lager en absolutt filbane til index.html-filen
        fs.readFile(filePath, (err, content) => { // Leser innholdet i index.html-filen
            if (err) { // Håndterer feil ved lesing av filen
                res.writeHead(500);     // Sender en 500 Internal Server Error-respons
                return res.end('Server error'); // Avslutter forespørselen med en feilmelding
            }
            res.writeHead(200, { 'Content-Type': 'text/html' }); // Sender en 200 OK-respons med riktig innholdstype for HTML
            res.end(content);   // Avslutter forespørselen med innholdet i index.html-filen
        });
    }

    else if (pathname === '/script.js') { // Håndterer forespørselen til script.js-filen
        fs.readFile('./script.js', (err, data) => { // Leser innholdet i script.js-filen
            if (err) {
                res.writeHead(404); // Sender en 404 Not Found-respons hvis filen ikke finnes
                return res.end('JS not found'); // Avslutter forespørselen med en feilmelding
            }
            res.writeHead(200, { 'Content-Type': 'application/javascript' }); // Sender en 200 OK-respons med riktig innholdstype for JavaScript
            res.end(data); // Avslutter forespørselen med innholdet i script.js-filen
        });
    }

    else if (pathname === '/elever') {  // Håndterer forespørselen til /elever-ruten
        let elever = lesData(); // Leser inn elevdataene fra JSON-filen

        if (method === 'GET') { // Håndterer GET-forespørselen for å hente elevdataene
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(elever));
        }

        else if (method === 'POST') { // Håndterer POST-forespørselen for å legge til en ny elev
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                const nyElev = JSON.parse(body);
                nyElev.id = Date.now();
                elever.push(nyElev);
                skrivData(elever);
                res.end(JSON.stringify(nyElev));
            });
        }

        else if (method === 'PUT') { // Håndterer PUT-forespørselen for å oppdatere en eksisterende elev
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => { //end er en hendelse som utløses når all data er mottatt
                const elev = JSON.parse(body);
                elever = elever.map(e => e.id === elev.id ? { ...e, ...elev } : e);
                skrivData(elever); // Oppdaterer elevdataene i JSON-filen
                res.end(JSON.stringify(elev)); // Sender tilbake den oppdaterte eleven som respons
            });
        }

        else if (method === 'DELETE') { // Håndterer DELETE-forespørselen for å slette en elev 
            let body = ''; // Initialiserer en tom streng for å lagre dataene som kommer i forespørselen
            req.on('data', chunk => body += chunk); // Når data kommer inn, legges det til i body-strengen, chunk er en del av dataene som kommer inn i forespørselen
            // 'data' er en hendelse som utløses når data kommer inn i forespørselen
            // 'end' er en hendelse som utløses når all data er mottatt
            req.on('end', () => { // Når all data er mottatt, utføres denne funksjonen
                const { id } = JSON.parse(body); // Parserer body-strengen til et JavaScript-objekt og henter id-en til eleven som skal slettes
                // 'JSON.parse' konverterer en JSON-streng til et JavaScript-objekt
                elever = elever.filter(e => e.id !== id); // Filtrerer ut eleven med den gitte id-en fra elevlisten
                skrivData(elever);
                res.end(JSON.stringify({ status: 'deleted' })); // Sender tilbake en bekreftelse på at eleven er slettet
            });
        }
    }

    else {
        res.writeHead(404);
        res.end('Ikke funnet');
    }
});

server.listen(5000, () => { // Starter serveren og lytter på port 3000
    console.log('Server kjører på http://localhost:5000'); // Logger til konsollen at serveren kjører
    // hvordan kan jeg kjøre serveren? node server.js
});
