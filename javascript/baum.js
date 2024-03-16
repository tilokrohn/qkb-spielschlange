"use strict"


let hinweistext
let zusatzbaeume = []
let hinweis = document.querySelector("hinweis")
let loeschhinweis = document.querySelector("loeschhinweis")
let loeschaktiv = false
let baumliste
let seite = document.querySelector('body')

// gespeicherte zusatzbäume auslesen und hinzufügen
if (localStorage.getItem("zusatzbaeume")) {
    zusatzbaeume = JSON.parse(localStorage.getItem("zusatzbaeume"))
    for (let i=0; i < zusatzbaeume.length; i++) {
        let liBaum = document.createElement("li")
        liBaum.innerHTML = '<span><a href="html_baum/neu.html">'+zusatzbaeume[i]+'</a></span>'
        let ulBaumliste1 = document.querySelector("div.baeume ul")
        ulBaumliste1.appendChild (liBaum)
    }  
}
else {console.log("nein")}

baumliste = document.querySelectorAll("div.baeume ul li")
// eventlistener an die listeneinträge und lieblingsliste markieren
for (let i=0; i < baumliste.length; i++) { 
    baumliste[i].addEventListener("mousedown", wahlLieblingsbaum)
    baumliste[i].addEventListener("mouseover", hinweis_in)
    baumliste[i].addEventListener("mouseout", hinweis_out)
    if (baumliste[i].innerText == localStorage.getItem("lieblingsbaum")) {
        baumliste[i].classList.add("lieblingsbaum")
    }
}

// bei klick rechts: lieblings bau neu (festlegen und anzeigen)
function wahlLieblingsbaum(e) {
    if (e.button == 2) {
        if (localStorage.getItem("lieblingsbaum") != this.innerText) {
            // alte anzeige deaktivieren
            for (let i=0; i < baumliste.length; i++) { 
                if (baumliste[i].innerText == localStorage.getItem("lieblingsbaum") ){
                    baumliste[i].classList.remove("lieblingsbaum")
                }
            }
            // neue aktivieren und merken
            this.classList.add("lieblingsbaum")
            localStorage.setItem("lieblingsbaum" ,this.innerText);
            hinweis.innerHTML = "<b>" + this.innerText + "</b>  ist Dein <b>NEUER Lieblingsbaum</b>"       
        }        
    }
}

function hinweis_in() {
    hinweis.classList.add("hinweis_over")

    hinweistext=hinweis.innerText
    if (this.innerText == localStorage.getItem("lieblingsbaum")) {
        hinweis.innerHTML = "<b>" + this.innerText + "</b>  ist derzeit Dein <b>Lieblingsbaum</b>"
    }
    else {
        hinweis.innerHTML = "Wähle <b>" + this.innerText + "</b> mit <b>Rechts</b>klick zu Deinem Lieblingsbaum"
    }
    
    for (let i=0; i < zusatzbaeume.length; i++) {
        if (zusatzbaeume[i] == this.innerText) {
             loeschhinweis.innerHTML = "Mit der Taste x kannst du Deinen selbst erstellten Baum löschen"
             loeschaktiv = this            
             seite.addEventListener("keydown", baumLoeschen)
        }
    }

}
function hinweis_out() {   
    hinweis.classList.remove("hinweis_over")
    hinweis.innerText = hinweistext
    loeschhinweis.innerText = "- - -"
    loeschaktiv = false
    seite.removeEventListener("keydown", baumLoeschen)

}

// aus Eingabe hinzufügen
let inputZusatzbaum = document.querySelector("input.zusatzbaum")
let buttonEintragen = document.querySelector("button#eintragen")
let ulBaumliste = document.querySelector("div.baeume ul")

buttonEintragen.addEventListener("click", baumAusEingabeHinzufuegen)

function baumAusEingabeHinzufuegen() {
    let liBaum = document.createElement("li")
    liBaum.innerHTML = '<span><a href="html_baum/neu.html">'+inputZusatzbaum.value+'</a></span>'
    ulBaumliste.appendChild (liBaum)
    liBaum.addEventListener("mousedown", wahlLieblingsbaum)
    liBaum.addEventListener("mouseover", hinweis_in)
    liBaum.addEventListener("mouseout", hinweis_out)
    
    // zu baumliste hinzufügen (damit als lieblingbsaum auswählbar)
    baumliste = document.querySelectorAll("div.baeume ul li")
    // wäre wahrscheinlich besser, gleich die ul-node oben zu nehmen?, statt li-liste
    //  (dann könnte man auch node hinzufügen, so gehts aber erstmal auch)

    // in web-storage speichern  
    zusatzbaeume.push(inputZusatzbaum.value);
    localStorage.setItem("zusatzbaeume", JSON.stringify(zusatzbaeume));
}

// mit taste x löschen
function baumLoeschen(e) {
    if (e.key == "x" && loeschaktiv) {

        let loeschbaum = loeschaktiv.innerText

        ulBaumliste.removeChild(loeschaktiv)
        
        let index = zusatzbaeume.indexOf(loeschbaum)
        zusatzbaeume.splice(index,1)
        localStorage.setItem("zusatzbaeume", JSON.stringify(zusatzbaeume));

        hinweis_out()
        loeschhinweis.innerHTML = ' <div style="color:red">' + loeschbaum + ' gefällt dir nicht und wurde daher gefällt :-(</div>'

    }
    else {
        console.log("nix loeschen")
        // loeschhinweis.innerHTML = ' <div style="color:red">' + loeschbaum + ' kann nicht entfernt werden. Er ist schon immer hier und fest verwurzelt.'
    }
}










