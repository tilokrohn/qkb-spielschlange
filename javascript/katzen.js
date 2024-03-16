"use strict"

let katzenniedlichContainer = document.querySelector("#katzenniedlich-container");
let katzenboeseContainer = document.querySelector("#katzenboese-container");

let zusatzkatzenNiedlich = []
let seite = document.querySelector('body')
let loeschKatze
let lieblingsKatze = false

// 1. XHR/Ajax-Object erzeugen
let ajaxObjekt = new XMLHttpRequest()

// 2. Event-Handler
//Laden
ajaxObjekt.onload = function() {

    //dann dabei verarbeiten
    let katzenJson =  ajaxObjekt.response

    let katzenniedlichArray = katzenJson.katzenniedlich
    zeigeKatzenNiedlich (katzenniedlichArray)
    function zeigeKatzenNiedlich (array) {
        let katzeneintrag
        for(let i=0; i<array.length; i++) {
            katzeneintrag = erstelleKatzeNiedlich(array[i])
            katzenniedlichContainer.appendChild(katzeneintrag)
        }
    }

    let katzenboeseArray = katzenJson.katzenboese
    zeigeKatzenBoese (katzenboeseArray)
    function zeigeKatzenBoese (array) {
        let katzeneintrag
        for(let i=0; i<array.length; i++) {
            katzeneintrag = erstelleKatzeBoese(array[i])
            katzenboeseContainer.appendChild(katzeneintrag) 
        }
    }
}
// 3. Request/Ajax-Object öffnen
ajaxObjekt.open("GET","katzen.json")
// 4. Request/Ajax-Object konfigurieren
ajaxObjekt.responseType = "json"
// 5. Request senden
ajaxObjekt.send()

function erstelleKatzeNiedlich(katzeninfo) {
    let block = 
    `<img src="${katzeninfo.bild}" loading="lazy" alt="Katze ${katzeninfo.name}" title="${katzeninfo.titel}" class="katzenbild">` +
    `<div class="katzentext">` +
    `<h3>${katzeninfo.name}</h3>` +
    `${katzeninfo.text}` +
    `</div>`

    let element = document.createElement("div")
    element.className = "box"
    element.innerHTML = block
    element.addEventListener("mouseover", overNiedlicheKatze)
    element.addEventListener("mouseout", outNiedlicheKatze)
    element.addEventListener("mousedown", downNiedlicheKatze)

    return element
}

function erstelleKatzeBoese(katzeninfo) {

    let block = 
    `<h3><span>${katzeninfo.name}</span></h3>` +
    `${katzeninfo.text}` +
    `</div>`

    let element = document.createElement("div")
    element.className = `boesebox ${katzeninfo.class}`
    element.innerHTML = block

    return element
}

// storage auslesen
if (localStorage.getItem("zusatzkatzenNiedlich")) {
    zusatzkatzenNiedlich = JSON.parse(localStorage.getItem("zusatzkatzenNiedlich"))
    for (let i=0; i < zusatzkatzenNiedlich.length; i++) {

        let zusatzKatze = zusatzkatzenNiedlich[i]

        let katzeneintrag = erstelleKatzeNiedlich(zusatzKatze)
        katzenniedlichContainer.appendChild(katzeneintrag)
    }

}

  // niedliche katze aus input hinzufügen
  let buttonZusatzkatzeEintragen = document.querySelector("button#eintragen")
  buttonZusatzkatzeEintragen.addEventListener("click", erstelleZusatzKatzeNiedlich)
  let inputZusatzName = document.querySelector("input.zusatzname")
  let inputZusatzText = document.querySelector("input.zusatztext")
  let inputZusatzBild = document.querySelector("input.zusatzbild")
  let inputZusatzTitel = document.querySelector("input.zusatztitel")

  function erstelleZusatzKatzeNiedlich(e) {

    let zusatzKatze =  {
        name: inputZusatzName.value,
        text: inputZusatzText.value,
        bild: inputZusatzBild.value,
        titel:inputZusatzTitel.value
    }

    let katzeneintrag = erstelleKatzeNiedlich(zusatzKatze)
    katzenniedlichContainer.appendChild(katzeneintrag)

    // auch in storage hinzufügen 
    zusatzkatzenNiedlich.push(zusatzKatze);
    localStorage.setItem("zusatzkatzenNiedlich", JSON.stringify(zusatzkatzenNiedlich));
}

function overNiedlicheKatze () {
    seite.addEventListener("keydown", katzeLoeschen)
    loeschKatze = this
}

function outNiedlicheKatze () {
    seite.removeEventListener("keydown", katzeLoeschen)
}

function downNiedlicheKatze (e) {
    if (e.button == 2) {
        this.classList.add("liebsteNiedlicheKatze")
        if (lieblingsKatze) {
            lieblingsKatze.classList.remove("liebsteNiedlicheKatze")
        } 
        lieblingsKatze = this      
    }
}

function katzeLoeschen (e) {
    if (e.key == "x") {
        katzenniedlichContainer.removeChild(loeschKatze)
        // auch in storage löschen kommt später (geht derzeit nur in baumliste) 
    }
    else {
        console.log("nix loeschen")
    }
}