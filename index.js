const express = require('express');
const fetch = require('node-fetch');
const VPlanParser = require('./VPlanParser');

// Erstellt eine express-API-App
const app = express();


// Adresse: http://www.expample.com:3000/list/{Anzahl der zurückzugebenden Einträge}/{Gruppierung nach}
app.get('/list/:num', async (req, res) => {
    // Zahl der zurückzugebenden Elemente
    const num = req.params.num;

    // Inhalt fetchen
    const dataFetched = await fetch(`https://www.gymnasium-rutheneum.de/content/app/overview.php?limit=${num}`);

    // Html herausfiltern
    const htmlData = await dataFetched.text();

    // Html parsen
    const list = VPlanParser.parsePlanList(htmlData);
    
    // Antwort senden
    res.send(list);
});

// Adresse: http://www.expample.com:3000/list/{Anzahl der zurückzugebenden Einträge}/{Gruppierung nach}
app.get('/list/:num/:groupedBy', async (req, res) => {
    // Zahl der zurückzugebenden Elemente
    const num = req.params.num;

    // Gruppierungseigenschaft
    const groupedBy = req.params.groupedBy;

    // GroupedBy validieren
    if (!['ID', 'Date', 'LastUpdated', 'Weekday'].includes(groupedBy))
    {
        res.sendStatus(404);
        return;
    }

    // Inhalt fetchen
    const dataFetched = await fetch(`https://www.gymnasium-rutheneum.de/content/app/overview.php?limit=${num}`);

    // Html herausfiltern
    const htmlData = await dataFetched.text();

    // Html parsen
    const list = VPlanParser.parsePlanList(htmlData, groupedBy);
    
    // Antwort senden
    res.send(list);
});

// Adresse: http://www.example.com:3000/plan/{ID des Vertretungsplans}
app.get('/plan/:ID', async (req, res) => {
    const id = req.params.ID;

    // Daten über HTTP-GET anfordern
    const dataFetched = await fetch(`https://www.gymnasium-rutheneum.de/content/app/view.php?id=${id}`);

    // HTML-Rohdaten aus dem Request auslesen 
    const htmlData = await dataFetched.text();

    // HTML-Rohdaten parsen
    const parsedPlan = VPlanParser.parseVPlan(htmlData);

    // Antwort senden
    res.send(parsedPlan);
});

// API antwortet auf Port 3000
if (process.env.PORT)
    app.listen(process.env.PORT);
else
    app.listen(3000);