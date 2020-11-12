# frontend-data
![picture of data visualisatoin](https://i.pinimg.com/originals/2e/e6/99/2ee6998e34c3e2eff7b894c66cfc5267.jpg)

## :grey_question: Beschrijving
In deze repo vind je mijn proces van het vak functional programming, een 2 weken durend vak gegeven aan de HvA Tech-Track op Communication & Multimedia Design.

### :red_car:  Opdracht 
De opdracht is het maken van een verhalende visualisatie voor de Volkskrant, met als thema 'de auto in de stad'. Hierbij is het zaak dat er een nieuwswaarde aan het verhaal hangt en alles een geheel vormt. 

### Proces
Voor mijn volledige proces kun je naar de Wiki navigeren, waar ik mijn proces en denkwijze documenteer
https://github.com/SamSlotemaker/frontend-data/wiki

#### Week 1
![gif](public/style/images/colors.gif)     
Het resultaat van week 1 is te vinden op github pages
https://samslotemaker.github.io/functional-programming/SURVEYdata/dataOpschonen/public/index.html

#### Week 2
![Imgur](https://imgur.com/aNpveBh.png)
Huidige status week 2:
https://samslotemaker.github.io/functional-programming/RDWdata/


## :pencil: Concept 

## ❓ Hoofdvraag
Is er samenhang te vinden tussen parkeerverniewing in gemeentes en de welvaart van deze spefieke gemeente?
_Dit is te meten door gemiddeld vermogen en de parkeerprijs per locatie, waarbij parkeervernieuwing de groei is in nieuwe parkeergelegenheden, carpoollocaties en parkeerautomaten_

## ❔ Deelvragen
**1. Op welke plaatsen en in welk jaar is er sprake van vernieuwing (groei in hoeveelheid parkeerautomaten/garages/carpoollocaties)?**    
_beschikbare data:_
* [GEO informatie van verkooppunten](https://opendata.rdw.nl/Parkeren/Open-Data-Parkeren-GEO-VERKOOPPUNT/cgqw-pfbp/data)
   * Startsellingpoint: datum waarop verkooppunt actief werd
   * Location: geolocatie
* [Parkeergarages](https://opendata.rdw.nl/Parkeren/GEO-Parkeer-Garages/t5pc-eb34/data)
   * Startdatearea: datum waarop de garage actief werd
   * Location: geolocatie
* [Carpoollocaties](https://opendata.rdw.nl/Parkeren/GEO-Carpool/9c54-cmfx/data)
   * Startdatearea: datum waarop de carpoollocatie actief werd
   * Location: geolocatie

**Verwachting:** Ik verwacht dat er in grote steden een grotere groei te zien is, vooral de afgelopen jaren doordat er steeds meer auto's op de weg komen. 
***

**2. Is deze groei hoger op plaatsen waar de parkeerprijs duurder is?**    
_beschikbare data:_
* [Prijzen van parkeergebieden](https://opendata.rdw.nl/Parkeren/Open-Data-Parkeren-TARIEFDEEL/534e-5vdg/data)
    * AreaManagerId - nodig om te koppelen aan een andere tabel om zo de geolocatie te achterhalen
    * AmountFarePart - prijs in euro's per stap
    * StepSizeFarePart - grootte van de stap in minuten
_Bovenstaande data kan ik gebruiken om een uurprijs te bepalen_

**Verwachting:** Ik verwacht dat er zeker een verband is tussen prijs en vernieuwing. Ik denk dat ik wel in mijn achterhoofd moet houden dat de prijs in steden waarschijnlijk hoger ligt, dus dat de vernieuwing ook kan komen doordat steden simpelweg voller raken.
***

**3. Is deze groei hoger op plaatsen waar het gemiddelde vermogen van de gemeente groter is?**    
_beschikbare data:_     
* [CSV met vermogen per gemeenten](https://www.cbs.nl/nl-nl/nieuws/2019/47/vermogen-van-huishoudens-opnieuw-gestegen)
   * Gemeente
   * Gemiddeld vermogen per huishouden - toont welvaart aan binnen de regio

**Verwachting:** Ik verwacht niet perse dat het vermogen van huishoudens in contact staat met een groot vernieuwing in parkeergelegenheden. Ik denk juist dat een gebied dat veel welvaart heeft, minder externe parkeergelegenheid nodig heeft
***

Om mijn concept uit te werken wil ik alle geolocaties omzetten naar plaatsnamen. Hiermee kan ik met alle uurprijzen een gemiddelde prijs bepalen per plaats en op deze manier de prijzen, vermogens en vernieuwing samenvoegen.

### Concept schetsen
https://github.com/SamSlotemaker/frontend-data/wiki/4.1-Concept#schets-visualisatie

## Data
### Voorbeeld objecten verkregen data
```js
{areamanagerid: "299",
sellingpointid: "8711",
startdatesellingpoint: "20180604", 
sellingpointdesc: "Parkeerterrein Didamsestraat", 
location: {latitude: "51.928164446", longitude: "6.078784008"}
sellingpointdesc: "Parkeerterrein Didamsestraat",
sellingpointid: "8711",
startdatesellingpoint: "20180604"}
```

```js
{amountcumulative: "0",
amountfarepart: "0",
areamanagerid: "34",
enddatefarepart: "20170102",
enddurationfarepart: "4",
farecalculationcode: "BEZVGBZ",
startdatefarepart: "20161101",
startdurationfarepart: "0",
stepsizefarepart: "4",
}
```

### Getransformeerd data object
```js
{city: "Zevenaar", gemiddeldeUurPrijs: 0.9000000000000002, gemiddeldeGroeiPerJaar: 16, vermogen: 34.8}
```
Het gedetailleerde proces vind je in mijn wiki
https://github.com/SamSlotemaker/frontend-data/wiki/Data-transformation

### Lege waardes
Bij lege of invalide waarde in de coordinaten/plaatsnaam wordt het object volledig genegeerd. Ik kan in mijn geval niks met een onbekende plek. 
Lege/invalide waardes bij groei, vermogen of uurprijs worden op 0 gezet. Op deze manier kunnen er alsnog andere vergelijkingen gedaan worden. Ook kunnen lege waardes bij groei en uurprijs betekenen dat er daatwerkelijk geen groei is of het parkeren gratis is. 

## Visualisatie
Een scatterplot waar verbanden ontdekt kunnen worden tussen de groei in parkeervernieuwing en vermogen/gemiddelde uurprijs per stad
https://samslotemaker.github.io/frontend-data/public/index.html
![Imgur](https://imgur.com/L9JMv3Y.png)

### Voorbeeld
De visualisatie is ontwikkeld vanuit een voorbeeld van Curren
https://vizhub.com/curran/9247d4d42df74185980f7b1f7504dcc5
![Imgur](https://imgur.com/PyTIbyw.png)
## :gear: Installation
1. Clone deze repository
```
git clone https://github.com/SamSlotemaker/frontend-data.git
```
2. Installeer npm packages
```
npm install
```
3. Run live server
```
npm start
```
4. Open project in browser on port 8000


## :heart: Aknowledgement
* StackOverflow voor bug fixes
* Medium voor aanvullende informatie
* Curran Kelleher
* D3 documentatie https://github.com/d3
* HvA Tech-Track docenten: Laurens Aarnoudse, Danny de Vries, Robert Spier
* Medestudenten (Support groep 7 in het bijzonder)