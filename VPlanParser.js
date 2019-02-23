const JSDOM = require('jsdom').JSDOM;

class VPlanParser {
    // Parser für die Liste der Vertretungspläne
    static parsePlanList(rawHtml, groupedBy) {
        const doc = new JSDOM(rawHtml);

        // Die Tabelle aus dem HTML-Quelltext auswählen
        const tableDiv = doc.window.document.querySelector('.table');

        // Die Einträge in der Tabelle auswählen
        const tableEntries = tableDiv.querySelectorAll('.tr');

        // Jeden einzelnen Eintrag parsen
        let entries = Array.from(tableEntries.entries()).map(entry => {
            if (entry[1].textContent === ' Plan für... Datum Update') return undefined;
            /*
            Example Entry:

            <div class="td lout03">
                <a class="link1" href="/content/app/view.php?id=429">Mittwoch</a>
            </div>
            <div class="td lout03" style="text-align:center;">
                <span class="stext">20.02.</span>
            </div> 
            <div class="td lout03" style="text-align:center;">
                <span class="stext">19.02. (11:35 Uhr)</span>
            </div> 
            */

            const idRegex = /\d+/g;

            // Die Elemente mit den relevanten Informationen auswählen
            const stext = Array.from(entry[1].querySelectorAll('.stext'));
            const href = entry[1].querySelector('.link1');
            const hrefContent = href.getAttribute('href');

            // Daten filtern und als Objekt zurückgeben
            return {
                ID: idRegex.exec(hrefContent)[0],
                Weekday: entry[1].querySelector('.link1').textContent,
                Date: stext[0].textContent,
                LastUpdated: stext[1].textContent
            };
        });


        entries = entries.splice(1, entries.length - 1); 
        let grouped = entries;

        if (groupedBy)
            grouped = this.groupBy(grouped, groupedBy);

        return grouped;        
    }

    // Parser für einen Vertretungsplan
    static parseVPlan(rawHtml) {
        const dom = new JSDOM(rawHtml);

        // Das Element mit den relevanten Daten aus dem HTML-Code auswählen
        const infoElt = dom.window.document.querySelector('.box');

        // Allgemeine Informationen aus dem Vertretungsplan herausfiltern
        const allgemeineInformationen = infoElt.childNodes[1].textContent;

        // Rest der Tabelle parsen
        const table = this.parseTable(infoElt);

        return {
            Allgemein: allgemeineInformationen,
            Plan: table
        };
    }

    // Parser für die Vertretungsplantabelle
    static parseTable(infoElt) {
        // Zeilen aus der HTML-Tabelle filtern
        const rows = Array.from(infoElt.querySelectorAll('tr'));

        // Leeres Objekt anlegen um den Vertretungsplan hier einzufüllen
        const table = [];
        const stundenRegex = /^(\d)\. Stunde$/;

        // Index für die Stunde
        let stunde = 0;

        // Jede Zeile in der HTML-Tabelle durchgehen
        for (const row of rows) {
            // Leere Zeile überspringen
            if ((/^\s+$/).test(row.textContent)) continue;
            
            // Nächste Stunde
            if (stundenRegex.test(row.textContent)) {
                stunde = stundenRegex.exec(row.textContent)['1'];

                // Eigenschaft für die nächste Stunde anlegen und ein leeres Array darin hinterlegen
                table[table.length] = {
                    StundenNummer: stunde,
                    Content: []
                };
                continue;
            }

            // Zeile parsen
            table[table.length - 1].Content.push({
                Kurs: row.childNodes[0].textContent,
                Details: row.childNodes[1].textContent
            });
        }

        return table;
    }

    // Auch nur aus dem Internet :)
    // Gruppiert eine Liste nach einer Eigenschaft der enthaltenen Objekte
    static groupBy(xs, key) {
        return xs.reduce((rv, x) => {
          (rv[x[key]] = rv[x[key]] || []).push(x);
          return rv;
        }, {});
    }
}

module.exports = VPlanParser;
