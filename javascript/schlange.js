"use strict"

// STARTEINSTELLUNGEN

let posiRechts = 285
let posiUnten = 350

let startrichtung = "rechts" 

let bewegung = true

// eigenzlich abhängig von richtung (aber geschwindigkeit extra)
let bewegungswert = 0.4 // geschwindigkeit: 0,5 langsamer / 2 schneller
let kopfRotation = 0 // bei nach nach rechts


let nachRechts = bewegungswert // -bewegungswert: entgegengesetzte Richtungen
let nachUnten = 0
let bewegungsrichtung // vielleicht jetzt den bewegungswert oben woanders 
                               // (als/in einer startfunktion ändere funktion gleich aufrufen) -> ist davon abhähgig
                               // eingeführt erst zum umkehren
let spur = false

let modusMausrichtungswahl = 1 // gibt erstmal nur diese

// weitere Variablen

let treffer = 0

let next_X, next_Y

let nrSchlangeAnimation
let gesamtzähler = 1
let wendepausezähler = 0
let wendepause = 0 // auch null wenn gliederwechseln lange genug dauert...

let gliedRadius = 15
let maulAuf_A_max = 0.7
let maulAuf_B_max = -0.7
let maulAuf_A = maulAuf_A_max 
let maulAuf_B = maulAuf_B_max // unter Umständen könnte einer 0 sein, aber nicht, falls rahmen benutzt - oder wenn nicht mittig sein soll
let maulBewegungswert = 0.01

// könnte option geben, ob überhaupt maul-ani, und wenn ja, was der startwert ist
let maulAufmachen = false // startwert
let maulZumachen = true // geht nur eins von beiden...

let gliederAbstand = 9 // -2 / +4
let gliederStreckung_X ,gliederStreckung_Y
let gliederStreckungAlt_X ,gliederStreckungAlt_Y

let wenderichtung = "nein"

// weitere variablen für schlange
// kopflayout
let kopf_farbe = "#ff7700"

let augenfarbe = "#000000"
let augenblinkfarbe1 = "#ff0000"
let augenblinkfarbe2 = "#ffffff"
let augenblinkfarbe = augenblinkfarbe2
let blinkzusatz_radius1 = 2
let blinkzusatz_radius2 = 0

// gliederlayout
let glied_1_farbe = "#ff9900"
let glied_2_farbe = "#ffbb00"
let glied_3_farbe = "#ffcc00"

// variablen für reihenfolge und richtung (bearbeitet in sortiereSchlange, gezeichnet/verwendet in bewegeSchlange)

let posiRechtsAlt // nur für eine jetzt und in schlange direkt
let posiUntenAlt // nur für eine jetzt und in schlange direkt
let gliederÄnderung = -1
let stand_X, stand_Y
let stand_next_X = 0
let stand_next_Y = 0
let posi_alt // posi aus aktueller achse die nach bewegungsänderung geändert wird
let posi // aktuelle posi aus aktueller achse die nach bewegungsänderung geändert wird - wird vor erst direkt vor verwendung geholt

let achse // start: je nach start-bewegungsrichtung (brauche derzeit nur aktulle)
let alteRichtung

/////////////////////////////////////////////////////

let canvas = document.querySelector('#spielschlange')
let context = canvas.getContext('2d')

// >>> größenauslesung/resize und schlange/bewegungsstart    
window.addEventListener('resize', resizeCanvas, false)
function resizeCanvas() {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        console.info(`Größe Malfläche: ${canvas.width} x ${canvas.height}`)

        // Zeichnungen müssen sich in dieser Funktion befinden, sonst werden sie zurückgesetzt,
        //   wenn Größe des Browserfensters geendert wird und die Malfläche wird gelöscht. 
                  
            zeichnen()
            


    }
resizeCanvas(); // <<< größenauslesung/resize und schlange/bewegungsstart  

// "initialisierung"
ändereRichtung (startrichtung)

////////////////////////////
// >>> key+maus abfangen >>>
window.addEventListener("keydown", tastenauswahl)

function tastenauswahl(ereignis) {
    let taste =  ereignis.key
    let tastenbefehl = taste.toLowerCase()


    switch (tastenbefehl) {
        case "r" :
        case "d" :
        case "arrowright" :
            ändereRichtung("rechts")
            break;
        case "l" :
        case "a" :
        case "arrowleft" :
            ändereRichtung("links")
            break;
        case "u" :
        case "s":
        case "arrowdown" :
            ändereRichtung("unten")
            break;
        case "o" :
        case "w":
        case "arrowup" :
            ändereRichtung("oben")
            break;
        case "#" :
            spur = !spur 
            console.info("spur: " + spur)
            break;
        case "x" :
            startstopSchlange(true)
            break;
        default:
            console.info("unbekannter befehl")
            break;
    }
}

window.addEventListener("mousedown", mausauswahl)

function mausauswahl(ereignis) {

    if (modusMausrichtungswahl == 1) {

        let abweichungX = posiRechts - ereignis.pageX
        let abweichungY = posiUnten - ereignis.pageY

        // klick weiter waagerecht oder senkrecht entfernt?
        if (Math.abs(abweichungX) > Math.abs(abweichungY)) {
            // vor oder hinter der schlange (genauer: vom schlankenkopf-ausgangspunkt)
            if (ereignis.pageX > posiRechts){
                ändereRichtung("rechts")
            }
            else if (ereignis.pageX < posiRechts) {
                ändereRichtung("links")
            }
        }
        else {
            if (ereignis.pageY > posiUnten){
                ändereRichtung("unten")
            }
            else if (ereignis.pageY < posiUnten) {
                ändereRichtung("oben")
            }
        }
    }
    startstopSchlange(false) // bei mausklick auch starten, falls steht
}
// <<< key+maus abfangen <<< 
////////////////////////////


function ändereRichtung(richtung) {
    // betrifft kopf (weitere gliederpositionen kommen in sortiereSchlange hinzu)
    if (gliederÄnderung == -1 && richtung != bewegungsrichtung) {
        console.info("ändere in richtung: " + richtung)
        switch (richtung) {
            case "rechts" :
                // wenn wenden, dann in einer kleinen schleife (zufällig rechts oder links)
                if (bewegungsrichtung == "links") {
                    wenderichtung = richtung
                    ändereRichtung( (Math.random()<0.5) ? "oben" : "unten"  )
                }
                // wenn vorher wende/umdrehen eigeleitet wurde, dann weiter mit nächstem schritt
                else {
                // gerade weiterbewegung
                    nachRechts = bewegungswert
                    nachUnten = 0
                    kopfRotation = 0
                    // glieder
                    stand_X = next_X
                    stand_Y = next_Y
                    posi_alt = posiRechts
                    next_X  = -(gliedRadius*2+gliederAbstand)
                    next_Y  = 0
                    alteRichtung = bewegungsrichtung
                    bewegungsrichtung = richtung
                    achse = "x"
                    gliederÄnderung = 0
                    gliederStreckungAlt_X = gliederStreckung_X
                    gliederStreckungAlt_Y = gliederStreckung_Y
                    gliederStreckung_X = 5
                    gliederStreckung_Y = 0
                }
                break;
            case "links" :
                if (bewegungsrichtung == "rechts") {
                    wenderichtung = richtung
                    ändereRichtung( (Math.random()<0.5) ? "oben" : "unten"  )
                }
                else {
                    nachRechts = -bewegungswert
                    nachUnten = 0
                    kopfRotation = Math.PI
                    // glieder
                    stand_X = next_X
                    stand_Y = next_Y
                    posi_alt = posiRechts
                    next_X  = gliedRadius*2+gliederAbstand
                    next_Y  = 0
                    alteRichtung = bewegungsrichtung
                    bewegungsrichtung = richtung
                    achse = "x"
                    gliederÄnderung = 0
                    gliederStreckungAlt_X = gliederStreckung_X
                    gliederStreckungAlt_Y = gliederStreckung_Y
                    gliederStreckung_X = 5
                    gliederStreckung_Y = 0
                }
                break;
            case "unten" :
                if (bewegungsrichtung == "oben") {
                    wenderichtung = richtung
                    ändereRichtung( (Math.random()<0.5) ? "rechts" : "links" )
                }
                else {
                    nachRechts = 0
                    nachUnten = bewegungswert
                    kopfRotation = 0.5*Math.PI
                    // glieder
                    stand_X = next_X
                    stand_Y = next_Y
                    posi_alt = posiUnten
                    next_X  = 0
                    next_Y  = -(gliedRadius*2+gliederAbstand) 
                    alteRichtung = bewegungsrichtung
                    bewegungsrichtung = richtung
                    achse = "y"
                    gliederÄnderung = 0
                    gliederStreckungAlt_X = 0
                    gliederStreckungAlt_Y = 5
                    gliederStreckungAlt_X = gliederStreckung_X
                    gliederStreckungAlt_Y = gliederStreckung_Y
                    gliederStreckung_X = 0
                    gliederStreckung_Y = 5


                }
                break;
            case "oben" :
                if (bewegungsrichtung == "unten") {
                    wenderichtung = richtung
                    ändereRichtung( (Math.random()<0.5) ? "rechts" : "links" )
                }
                else {
                    nachRechts = 0
                    nachUnten = -bewegungswert
                    kopfRotation = 1.5*Math.PI
                    // glieder
                    stand_X = next_X
                    stand_Y = next_Y
                    posi_alt = posiUnten
                    next_X  = 0
                    next_Y  = gliedRadius*2+gliederAbstand
                    alteRichtung = bewegungsrichtung
                    bewegungsrichtung = richtung
                    achse = "y"
                    gliederÄnderung = 0
                    gliederStreckungAlt_X = gliederStreckung_X
                    gliederStreckungAlt_Y = gliederStreckung_Y
                    gliederStreckung_X = 0
                    gliederStreckung_Y = 5
                }
                break;
            default:
                console.info("unbekannter befehl")
                exit()
                break;
        }
    }
    else {
        console.info("Ignoriere Richtungsbefehl")
    }
}

function startstopSchlange(komplett) {

    if (!bewegung) {
        bewegung = !bewegung
            // wenn nur bewegungsstatus ändere, startet sie noch nicht (aber bei stop stoppt sie)
            // aber nicht doppelt starten darf !
        zeichnen() 
    }
    else if (komplett) {
        bewegung = !bewegung
    }
}

function gegenrichtungFestlegen (alterichtung) {
    let gegenrichtung
    switch (alterichtung) {
        case "rechts" :
            gegenrichtung = "links"
            break;
        case "links" :
            gegenrichtung = "rechts"
            break;
        case "unten" :
            gegenrichtung = "oben"
            break;
        case "oben" :
            gegenrichtung = "unten"
            break;
        default:
            console.info("unbekannter befehl")
            break;
    }
    return gegenrichtung
}

////////////////////////
// SCHLANGE+BEWEGUNG >>>
function zeichnen() {

    // 1. Zeichenleere leere - für spur deaktivieren
    if (!spur) {
        context.clearRect(0,0,canvas.width,canvas.height)
    }
    else {
        kopf_farbe = "#c0c0c0"
        glied_1_farbe = "#c0c0c0"
        glied_2_farbe = "#c0c0c0"
        glied_3_farbe = "#c0c0c0"
    }

    context.fillStyle = "#ff00ff";

    context.save();

    verarbeiteZiele()
 
    //// SCHLANGE (Grafik)

    // KOPF
    context.beginPath();
    context.lineTo(posiRechts, posiUnten) // rahmen eine Maulseite
    context.ellipse(posiRechts,posiUnten, gliedRadius,gliedRadius,kopfRotation,maulAuf_A,maulAuf_B); //mittelpunktrechts+links, radiusX+Y, rotation , start+ende
    context.lineTo(posiRechts, posiUnten)
    context.fillStyle = kopf_farbe
    context.fill()
    // AUGEN
    function blinken() {
        if (gesamtzähler%25 == 0) {
            if (gesamtzähler%50 == 0){
                augenblinkfarbe=augenblinkfarbe2
                blinkzusatz_radius2 = 1
            }
            else{
                augenblinkfarbe=augenblinkfarbe1
                blinkzusatz_radius2 = 0
            }
        }
    }  
    if (bewegungsrichtung == "rechts") {
        // linkes auge
        context.beginPath()
        if (wenderichtung =="oben") {blinken();context.fillStyle=augenblinkfarbe;
            context.ellipse(posiRechts,posiUnten-gliedRadius/2, gliedRadius/5-1,(gliedRadius/10)+blinkzusatz_radius1+blinkzusatz_radius2,0,0,2 * Math.PI) }
        else{context.fillStyle=augenfarbe
            context.ellipse(posiRechts,posiUnten-gliedRadius/2, gliedRadius/5,gliedRadius/10,0,0,2 * Math.PI) }
        context.fill();
        // rechtes auge
        context.beginPath();
        if (wenderichtung =="unten") {blinken();context.fillStyle=augenblinkfarbe
            context.ellipse(posiRechts,posiUnten+gliedRadius/2, gliedRadius/5-1,(gliedRadius/10)+blinkzusatz_radius1+blinkzusatz_radius2,0,0,2 * Math.PI) }
        else {context.fillStyle=augenfarbe;
            context.ellipse(posiRechts,posiUnten+gliedRadius/2, gliedRadius/5,gliedRadius/10,0,0,2 * Math.PI) }
        context.fill();
    }
    else if (bewegungsrichtung == "links") {
        // rechtes auge
        context.beginPath()
        if (wenderichtung =="oben") {blinken();context.fillStyle=augenblinkfarbe; 
            context.ellipse(posiRechts,posiUnten-gliedRadius/2, gliedRadius/5-1,(gliedRadius/10)+blinkzusatz_radius1+blinkzusatz_radius2,0,0,2 * Math.PI) }
        else{context.fillStyle=augenfarbe
            context.ellipse(posiRechts,posiUnten-gliedRadius/2, gliedRadius/5,gliedRadius/10,0,0,2 * Math.PI) }
        context.fill();
        // linkes auge
        context.beginPath();
        if (wenderichtung =="unten") {blinken();context.fillStyle=augenblinkfarbe;
            context.ellipse(posiRechts,posiUnten+gliedRadius/2, gliedRadius/5-1,(gliedRadius/10)+blinkzusatz_radius1+blinkzusatz_radius2,0,0,2 * Math.PI) }
        else {context.fillStyle=augenfarbe;
            context.ellipse(posiRechts,posiUnten+gliedRadius/2, gliedRadius/5,gliedRadius/10,0,0,2 * Math.PI) }
        context.fill();
    }
    else if (bewegungsrichtung == "unten") {
        // linkes auge
        context.beginPath()
        if (wenderichtung =="links") {blinken();context.fillStyle=augenblinkfarbe; 
            context.ellipse(posiRechts-gliedRadius/2,posiUnten, (gliedRadius/10)+blinkzusatz_radius1+blinkzusatz_radius2,gliedRadius/5-1,0,0,2 * Math.PI); }
        else{context.fillStyle=augenfarbe;
            context.ellipse(posiRechts-gliedRadius/2,posiUnten, gliedRadius/10,gliedRadius/5,0,0,2 * Math.PI); }
        context.fill();
        // rechtes auge
        context.beginPath();
        if (wenderichtung =="rechts") {blinken();context.fillStyle=augenblinkfarbe;
            context.ellipse(posiRechts+gliedRadius/2,posiUnten, (gliedRadius/10)+blinkzusatz_radius1+blinkzusatz_radius2,gliedRadius/5-1,0,0,2 * Math.PI); }
        else {context.fillStyle=augenfarbe;
            context.ellipse(posiRechts+gliedRadius/2,posiUnten, gliedRadius/10,gliedRadius/5,0,0,2 * Math.PI); }
        context.fill();
    }
    else if (bewegungsrichtung == "oben") {
        // linkes auge
        context.beginPath()
        if (wenderichtung =="links") {blinken();context.fillStyle=augenblinkfarbe; 
            context.ellipse(posiRechts-gliedRadius/2,posiUnten, (gliedRadius/10)+blinkzusatz_radius1+blinkzusatz_radius2,gliedRadius/5-1,0,0,2 * Math.PI) }
        else{context.fillStyle=augenfarbe;
            context.ellipse(posiRechts-gliedRadius/2,posiUnten, gliedRadius/10,gliedRadius/5,0,0,2 * Math.PI) }
        context.fill();
        // rechtes auge
        context.beginPath();
        if (wenderichtung =="rechts") {blinken();context.fillStyle=augenblinkfarbe;
            context.ellipse(posiRechts+gliedRadius/2,posiUnten, (gliedRadius/10)+blinkzusatz_radius1+blinkzusatz_radius2,gliedRadius/5-1,0,0,2 * Math.PI) }
        else {context.fillStyle=augenfarbe;
            context.ellipse(posiRechts+gliedRadius/2,posiUnten, gliedRadius/10,gliedRadius/5,0,0,2 * Math.PI) }
        context.fill();
    }

    //Glieder nach Kopf

    //zusatzglied 1
    context.beginPath();  
    context.fillStyle = glied_1_farbe
    if (gliederÄnderung < 0 || gliederÄnderung > 0 ) {
        context.ellipse(posiRechts+next_X, posiUnten+next_Y, gliedRadius+gliederStreckung_X, gliedRadius+gliederStreckung_Y, 0, 0 ,2 * Math.PI)
    }
    else {
        context.ellipse(posiRechtsAlt+stand_X, posiUntenAlt+stand_Y, gliedRadius+gliederStreckungAlt_X, gliedRadius+gliederStreckungAlt_Y, 0, 0 ,2 * Math.PI); 
    }
   
    context.fill();
    //zusatzglied 2
    context.beginPath();
    context.fillStyle = glied_2_farbe
    if (gliederÄnderung < 0 || gliederÄnderung > 1) {
        context.ellipse(posiRechts+next_X*2, posiUnten+next_Y*2, gliedRadius+gliederStreckung_X, gliedRadius+gliederStreckung_Y, 0, 0 ,2 * Math.PI)
    } 
    else {
        context.ellipse(posiRechtsAlt+stand_X*2+stand_next_X, posiUntenAlt+stand_Y*2+stand_next_Y, gliedRadius+gliederStreckungAlt_X, gliedRadius+gliederStreckungAlt_Y, 0, 0 ,2 * Math.PI);
    } 
    context.fill();
    //zusatzglied 3 -> letztes Glied
    context.beginPath();
    context.fillStyle = glied_3_farbe
    context.font = 'bold 22px arial'
    if (gliederÄnderung < 0 || gliederÄnderung > 2) {
        context.ellipse(posiRechts+next_X*3, posiUnten+next_Y*3, gliedRadius+gliederStreckung_X, gliedRadius+gliederStreckung_Y, 0, 0 ,2 * Math.PI)
        context.fill()
        if (!spur) {
            if(treffer<0){context.fillStyle="red"}else if(treffer>0){context.fillStyle="green"}else{context.fillStyle="black"}
            context.fillText(Math.abs(treffer), posiRechts+next_X*3-7, posiUnten+next_Y*3+7)
        }
    } 
    else {
        context.ellipse(posiRechtsAlt+stand_X*3+stand_next_X, posiUntenAlt+stand_Y*3+stand_next_Y, gliedRadius+gliederStreckungAlt_X, gliedRadius+gliederStreckungAlt_Y, 0, 0 ,2 * Math.PI);
        context.fill()
        if (!spur) {
            if(treffer<0){context.fillStyle="red"}else if(treffer>0){context.fillStyle="green"}else{context.fillStyle="black"}
            context.fillText(Math.abs(treffer), posiRechtsAlt+stand_X*3+stand_next_X-5, posiUntenAlt+stand_Y*3+stand_next_Y+7)
        }
    }

    context.restore();

    ////////////////////////////
    // weiterere Abfragen und Berechnungen (in Zeichenschleife)
    
    if (gliederÄnderung == -1) {
        posiRechtsAlt = posiRechts  
        posiUntenAlt = posiUnten

        if (wenderichtung != "nein") {        
            ändereRichtung(wenderichtung)
            wenderichtung = "nein"
        }
        // rand-abfrage (
        //  -> dann in einer kleinen schleife (zufällig rechts oder links) umdrehen 
        //     (an maximalen rändern (rechts und unten) muss elementgröße eingerchnet werden)
        else if (posiRechts <= 0 | posiRechts+20 >= canvas.width) {
            ändereRichtung( gegenrichtungFestlegen(bewegungsrichtung) )
        }
        else if (posiUnten <= 0 | posiUnten+20 >= canvas.height) {
            ändereRichtung( gegenrichtungFestlegen(bewegungsrichtung) )
        }
    }
    else if (gliederÄnderung > 2) {
        gliederÄnderung = -1
        stand_next_X = 0
        stand_next_Y = 0
    }
    else {
        (achse == "x") ? posi = posiRechts : posi = posiUnten // brauche abstand zur alten position

        if ( (gliedRadius*2+gliederAbstand) <= Math.abs(Math.abs(posi)-Math.abs(posi_alt)) ) {
           
                gliederÄnderung ++
               
                // vergleichspositom weitersetzen
                if (bewegungsrichtung == "rechts" || bewegungsrichtung == "unten") {                 
                    posi_alt = posi_alt + (gliedRadius*2 + gliederAbstand)
                }
                else {
                    posi_alt = posi_alt - (gliedRadius*2 + gliederAbstand)
                }
  
                switch(alteRichtung) {
                    case "rechts" : stand_next_X = -stand_X*(gliederÄnderung) ;break
                    case "links"  : stand_next_X = -stand_X*(gliederÄnderung) ;break
                    case "unten"  : stand_next_Y = -stand_Y*(gliederÄnderung) ;break
                    case "oben"   : stand_next_Y = -stand_Y*(gliederÄnderung)  ;break
                }   
        }     
    }

    // nächste mal-(grund-)position
    posiRechts = posiRechts + nachRechts 
    posiUnten = posiUnten + nachUnten

    // MAUL bewegen
    if (maulZumachen == true) {
        if (maulAuf_A <= 0.01 && maulAuf_B >= -0.01) {
            maulAuf_A = 0.01
            maulAuf_B = -0.01
            maulZumachen = false
            maulAufmachen = true     
        }
        else {
            maulAuf_A = maulAuf_A - maulBewegungswert
            maulAuf_B = maulAuf_B + maulBewegungswert 
        }
    }
    else if (maulAufmachen == true) {
        if (maulAuf_A > maulAuf_A_max && maulAuf_B < maulAuf_B_max) {
            maulAuf_A = maulAuf_A_max
            maulAuf_B = maulAuf_B_max
            maulAufmachen = false
            maulZumachen = true  
        }
        else {
            maulAuf_A = maulAuf_A + 0.01 // (maulBewegungswert)
            maulAuf_B = maulAuf_B - 0.01 // maulBewegungswert  
        }
    }
    else {
        console.info("Da stimmt was nicht, bei der Maulbewegung!")
    }
    
    gesamtzähler++

    // Bewegung
    if (/*gesamtzähler > 10000 ||*/ bewegung == false) { // stop-bedingung
        cancelAnimationFrame(nrSchlangeAnimation);
    } else {
        nrSchlangeAnimation = requestAnimationFrame(zeichnen)
    } 

}
/////////////////////////
// <<< SCHLANGE+BEWEGUNG + mehr

/// Ziele zeichnen und auswerten
function verarbeiteZiele() {
    
    ziele.forEach(function(ziel) {


        if (ziel.status == true) {
            if (ziel.bedeutung == "hindernis") {
                context.fillStyle = ziel.farbe
                context.fillRect(ziel.posiRechts, ziel.posiUnten, ziel.größeRechts, ziel.größeUnten)
            }
            else if (ziel.bedeutung == "beute") {
                context.strokeStyle = ziel.farbe
                context.strokeRect(ziel.posiRechts, ziel.posiUnten, ziel.größeRechts, ziel.größeUnten)
            }
        
            // auf kollision testen
            if (bewegungsrichtung == "rechts") { // kopf nach rechts trifft auf linken ziel-Rand

                // 3: verzögerung der reaktion bei auftreffen auf die seite (von laufrichtung aus)               
                // 6: begrenzung auf irgendwas hinter treffer (muss innerhalb des elements sein und größer als die größte schrittweite[geschwindigkeit] )
                // testwerte bei zielgröße 30x30 und radius 15
            
                if ( ( posiRechts > ziel.posiRechts - gliedRadius +3 ) &&                // linker ziel-Rand  285-3 # gleich geht nicht, weil nicht gerade zahlen
                     ( posiRechts < ziel.posiRechts - gliedRadius + 6 ) &&               // rechter ziel-Rand       # muss daher begrenzen, auf irgendwas dahinter (zumindest innerhalb des elements)
                     ( posiUnten > ziel.posiUnten - gliedRadius) &&                      // oberer ziel-Rand 185
                     ( posiUnten < ziel.posiUnten + ziel.größeUnten + gliedRadius ) // unterer ziel-Rand 245
                    )  {      
                        if (ziel.bedeutung == "hindernis") {
                            treffer--
                        }
                        else if (ziel.bedeutung == "beute") {
                            treffer++
                        }    
                        ziel.status = false
                } 
            }
            else if (bewegungsrichtung == "links") {

                if ( ( posiRechts > ziel.posiRechts - 6 ) &&                                          // linker ziel-Rand
                     ( posiRechts < ziel.posiRechts + ziel.größeRechts + gliedRadius -3 )  &&    // rechter ziel-Rand 345-3
                     ( posiUnten > ziel.posiUnten - gliedRadius) &&                                   // oberer ziel-Rand 185
                     ( posiUnten < ziel.posiUnten + ziel.größeUnten + gliedRadius )              // unterer ziel-Rand 245
                    )  {     
                        if (ziel.bedeutung == "hindernis") {
                            treffer--
                        }
                        else if (ziel.bedeutung == "beute") {
                            treffer++
                        }           
                        ziel.status = false 
                }
            }
            else if (bewegungsrichtung == "unten") {

                if ( ( posiRechts > ziel.posiRechts - gliedRadius ) &&                        // linker ziel-Rand  285 
                     ( posiRechts < ziel.posiRechts + ziel.größeRechts + gliedRadius) &&  // rechter ziel-Rand 345
                     ( posiUnten > ziel.posiUnten - gliedRadius + 3 ) &&                      // oberer ziel-Rand  185+3
                     ( posiUnten < ziel.posiUnten + 6 )                                       // unterer ziel-Rand
                    )  {               
                        ziel.status = false 
                        if (ziel.bedeutung == "hindernis") {
                            treffer--
                        }
                        else if (ziel.bedeutung == "beute") {
                            treffer++
                        } 
                }
            }
            else if (bewegungsrichtung == "oben") {

                if ( ( posiRechts > ziel.posiRechts - gliedRadius ) &&                         // linker ziel-Rand  285 
                     ( posiRechts < ziel.posiRechts + ziel.größeRechts + gliedRadius) &&  // rechter ziel-Rand 345
                     ( posiUnten > ziel.posiUnten - 6 ) &&                                     // oberer ziel-Rand  
                     ( posiUnten < ziel.posiUnten + ziel.größeRechts - 3 )                 // unterer ziel-Rand 230-3
                    )  {               
                        if (ziel.bedeutung == "hindernis") {
                            treffer--
                        }
                        else if (ziel.bedeutung == "beute") {
                            treffer++
                        } 
                        ziel.status = false 
                }
            }
        }
    } )
}
