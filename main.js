const fs = require('fs');
const path = require('path');

const letterMap = new Map()

//add exceptions like äöü
letterMap['ä'] = 'a';
letterMap['ö'] = 'o';
letterMap['ü'] = 'u';


//Liste der Ordner die ein Schüler benötigt
const dirList = [
    "BT",
    "KMT",
    "TD_NIN",
    "TOG_EST",
    "ABU"
]

//dir um PdF zu platzieren
const pdfDir = "TOG_EST"

//temp. constants

//Pfad zu Ordner mit Lernenden drin.
const lernende = "/Users/Shared/Reinhard/BBZ Solothurn-Grenchen/GIGR-Klassen - EI20A/Lernende"

//Pfad zu Lehrmittel
const lehrmittel = "/Users/Shared/Reinhard/BBZ Solothurn-Grenchen/Fachschaften - Lehrmittelverteilung"


const buecher = fs.readdirSync(lehrmittel)
    .filter(name => !name.match(/\./))
    .map(name => ({
    name,
    list: fs.readdirSync(path.join(lehrmittel, name))
    })
)


let arrayLernende = fs.readdirSync(lernende)

for(let lehrling of arrayLernende){
    let arr = lehrling.split(' ')
    let last = arr.pop();

    arr.splice(0,0,last)

    let search = arr.join('-').toLowerCase()

    for(let l in letterMap){
        search = search.replace(l, letterMap[l])
    }


    //create folders if needed
    let dirPath = path.join(lernende, lehrling)

    let folderList = fs.readdirSync(dirPath)

    for(let dir of dirList){
        if(folderList.indexOf(dir) == -1){
            fs.mkdirSync(path.join(dirPath, dir))
        }
    }

    //find pdfs
    let pdfs = []

    for(let buch of buecher){
        let match = buch.list.find(e => e.match(`${search}.pdf`))
        if(match){
            pdfs.push({buch:buch.name, name:match})
        }
    }   
    
    //place missing pdfs

    let myPdfs = fs.readdirSync(path.join(dirPath, pdfDir));


    for(let pdf of pdfs){
        if(myPdfs.indexOf(pdf.name) == -1){
            //move pdf from distribution to student folder
            let oldPath = path.join(lehrmittel, pdf.buch, pdf.name)
            let newPath = path.join(dirPath, pdfDir, pdf.name)

            fs.renameSync(oldPath, newPath)

        }
    }

    if(pdfs.length == 0) console.log(`${lehrling}\n keine PDFs gefunden`)
}
