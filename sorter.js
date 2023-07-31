class ButtonManager {

    _addButton(text, onclick) {
        if ([...document.querySelectorAll("header button")].filter((b) => { return b.innerText === text }).length > 0) return;

        let button = document.createElement("button");
        button.innerText = text;
        button.onclick = onclick;
        document.querySelector("header").insertBefore(button, document.querySelector("header div"));
    }

    removeAllButtons() {
        document.querySelectorAll("header button").forEach((b) => { b.remove() });
    }

    addCompareButton() {
        this._addButton("Compare", startSorting);
    }

    addReCompareButton() {
        this._addButton("Re-compare", reCompare);
    }

    addSelect20PercentButton() {
        this._addButton("20%", select20Percent);
    }

    addSelect50PercentButton() {
        this._addButton("50%", select50Percent);
    }

    addSelect80PercentButton() {
        this._addButton("80%", select80Percent);
    }

    addSelectAllButton() {
        this._addButton("Select All", selectAll);
    }

    addDeselectAllButton() {
        this._addButton("Deselect All", deselectAll);
    }

    addExportButton() {
        this._addButton("Export", exportPics);
    }

}

class PageManager {
    _buttonManager = new ButtonManager();
    _main = document.querySelector("main");
    _stats = document.querySelector("#stats");
    _dropZone = document.querySelector("#file-drop-zone");
    _dropZoneText = document.querySelector("#file-drop-zone-text");
    _uploadedPics = document.querySelector("#uploaded-pics");
    _decisionBlock = document.querySelector("#decision");
    _exportSelector = document.querySelector("#export-selector");
    _leftImg = document.querySelector("#left-pic");
    _rightImg = document.querySelector("#right-pic");



    setStats(text) {
        this._stats.textContent = text;
    }

    removeAllUploadedPics() {
        document.querySelectorAll("#uploaded-pics img").forEach((i) => { i.remove() });
    }

    _isUploadedPicExist(file) {
        return document.querySelector(`#uploaded-pics img[alt="${file.name}"]`) !== null;
    }

    addUploadedPic(file) {
        this._uploadedPics.style.display = "initial";
        this._dropZoneText.style.display = "none";

        if (this._isUploadedPicExist(file)) return;

        let img = document.createElement("img");
        img.classList.add("uploaded-pic");
        img.src = URL.createObjectURL(file);
        img.alt = file.name;
        img.title = "Delete"
        img.onclick = (ev) => {
            ev.stopPropagation();
            img.remove();
            if (document.querySelectorAll("#uploaded-pics img").length === 0) {
                pageManger.setInitialState();
            } else if (document.querySelectorAll("#uploaded-pics img").length === 1) {
                this.setStats("Add more pics!")
                this._buttonManager.removeAllButtons();
            }
        }

        this._uploadedPics.appendChild(img);

        if (document.querySelectorAll("#uploaded-pics img").length > 1) {
            this._buttonManager.addCompareButton();
            this.setStats("Add more pics or start now!")
        } else if (document.querySelectorAll("#uploaded-pics img").length === 1) {
            this.setStats("Add more pics!");
        }
    }

    setInitialState() {
        this._buttonManager.removeAllButtons();
        this.setStats("Have a good comparison!");
        this._dropZone.style.display = "inherit";
        this._dropZoneText.style.display = "inherit";
        this._uploadedPics.style.display = "none";
        this._decisionBlock.style.display = "none";
        this._exportSelector.style.display = "none";

        this.removeAllUploadedPics();
    }

    setDecisionPage() {
        this._buttonManager.removeAllButtons();
        this._dropZone.style.display = "none";
        this._exportSelector.style.display = "none";
        this._decisionBlock.style.display = "inherit";
    }

    setDecisionPics(left, right) {
        this._leftImg.src = left.src;
        this._leftImg.alt = left.alt;
        this._rightImg.src = right.src;
        this._rightImg.alt = right.alt;
    }

    setExportPage(pics) {
        this.setStats("Well done! Ready to export?");
        this._decisionBlock.style.display = "none";
        this._exportSelector.style.display = "inherit";

        document.querySelectorAll("#export-selector img").forEach((i) => { i.remove(); })
        pics.forEach((pic, i) => {
            let img = document.createElement("img");
            img.src = pic.src;
            img.alt = pic.alt;
            img.title = pic.alt;
            img.classList.add("export-pic");
            if (i < 3 || ((i + 1) / pics.length) < 0.8) img.classList.add("selected-pic");
            img.onclick = (ev) => {
                ev.stopPropagation();
                img.classList.toggle("selected-pic");
            }
            this._exportSelector.appendChild(img);
        });


        this._buttonManager.addDeselectAllButton();
        this._buttonManager.addSelect20PercentButton();
        this._buttonManager.addSelect50PercentButton();
        this._buttonManager.addSelect80PercentButton();
        this._buttonManager.addSelectAllButton();
        this._buttonManager.addExportButton();
        this._buttonManager.addReCompareButton();
    }
}

const pageManger = new PageManager();
pageManger.setInitialState();

function dropHandler(ev) {
    ev.preventDefault();

    if (ev.dataTransfer.items) {
        [...ev.dataTransfer.items].forEach((item, i) => {
            if (item.kind === "file") {
                pageManger.addUploadedPic(item.getAsFile());
            }
        });
    } else {
        [...ev.dataTransfer.files].forEach((file, i) => {
            pageManger.addUploadedPic(file);
        });
    }
}


function dragOverHandler(ev) {
    ev.preventDefault();
}

function inputUploaderHandler(files) {
    [...files].forEach((file, i) => {
        pageManger.addUploadedPic(file);
    });
}

class BinarySearch {
    constructor(array) {
        this.a = array;
        this.low = 2;
        this.high = 1;
        this.needsComparison = false;
    }

    isInProgress() { return this.low <= this.high; }

    isNeedsComparison() { return this.needsComparison; }

    startSearch(item, low, high) {
        this.item = item;
        this.low = low;
        this.high = high;
    }

    step() {
        if (this.needsComparison) throw Error("Needs comparison");

        if (this.low > this.high) return this.low;

        this.mid = Math.floor(this.low + (this.high - this.low) / 2);
        this.needsComparison = true;
        return [this.a[this.mid], this.item];
    }

    stepAnswer(betterPic) {
        if (!this.needsComparison) throw Error("No comparison needed");

        if (betterPic.alt === this.item.alt) {
            this.low = this.mid + 1;
        } else {
            this.high = this.mid - 1;
        }

        this.needsComparison = false;
    }
}

class Comparator {

    constructor() {
        this.pics = [];
        document.querySelectorAll("#uploaded-pics img").forEach((img, i) => {
            this.pics.push(img);
        });
        this.binarySearch = new BinarySearch(this.pics);
        this.state = 0; // 0 - before 1 - in progress of bs, need decision. 2 - in progress of bs, there is decision; 3 - finished
        this.i = 0;
    }

    isFinished() { return this.state === 3; }

    next() {
        if (this.state === 1) throw Error("Need decision");
        if (this.state === 3) throw Error("Comparison already finished");

        if (this.state === 0) {
            this.i += 1;
            this.j = this.i - 1;
            this.selected = this.pics[this.i];
            this.binarySearch.startSearch(this.selected, 0, this.j);
        }

        let bsResult = this.binarySearch.step();
        if (bsResult instanceof Array) {
            this.currentComparison = bsResult;
            this.state = 1;
            return bsResult;
        } else {
            this.state = 0;
            while (this.j >= bsResult) {
                this.pics[this.j + 1] = this.pics[this.j];
                this.j--;
            }
            this.pics[this.j + 1] = this.selected;
            if (this.i < this.pics.length - 1) {
                return this.next();
            } else {
                this.state = 3;
                return undefined; // finished!
            }
        }
    }

    decision(side) {
        if (this.state !== 1) throw Error("No decision needed");

        if (side === "left") {
            this.binarySearch.stepAnswer(this.currentComparison[0]);
        } else if (side === "right") {
            this.binarySearch.stepAnswer(this.currentComparison[1]);
        } else {
            throw Error("Invalid decision");
        }

        this.state = 2;
    }
}

let comparator;
let numOfDecisions = 0;

function startSorting() {
    pageManger.setDecisionPage();
    comparator = new Comparator();
    pageManger.setDecisionPics(...comparator.next());
    pageManger.setStats("Let's go!")
}

function sFact(num) {
    var rval = 1;
    for (var i = 2; i <= num; i++)
        rval = rval * i;
    return rval;
}

function onPairCompared() {
    const cResult = comparator.next();
    if (cResult === undefined) {
        pageManger.setExportPage(comparator.pics.reverse());
    } else {
        numOfDecisions++;
        let left = Math.round(Math.log2(sFact(comparator.pics.length))) - numOfDecisions;
        pageManger.setStats(left > 0 ? `About ${left} comparisons left` : "Almost done!");
        pageManger.setDecisionPics(...cResult);
    }
}

function leftPicClickHandler(e) {
    comparator.decision("left");
    onPairCompared();
}

function rightPicClickHandler(e) {
    comparator.decision("right");
    onPairCompared();
}

function reCompare() {
    startSorting();
    pageManger.setStats("Here we go again!")
}

function selectPercent(percent) {
    document.querySelectorAll("#export-selector img").forEach((img, i) => {
        if ((i + 1) / document.querySelectorAll("#export-selector img").length <= percent) {
            img.classList.add("selected-pic");
        } else {
            img.classList.remove("selected-pic");
        }
    });
}

function select20Percent() { selectPercent(0.2); }
function select50Percent() { selectPercent(0.5); }
function select80Percent() { selectPercent(0.8); }
function selectAll() { selectPercent(1); }
function deselectAll() { selectPercent(0); }


function exportPics() {
    const zip = new JSZip();
    let zipfilename = `${new Date().getFullYear()}_${new Date().getDate()}_${new Date().getMonth()}`;
    var folder = zip.folder(zipfilename);
    const pics = document.querySelectorAll("#export-selector img.selected-pic");
    for (let i = 0; i < pics.length; i++) {
        const img = pics[i];
        const url = img.src;
        const filename = `${String(i + 1).padStart(2, "0")}.${img.alt.split(".").splice(-1)[0]}`;
        folder.file(filename, fetch(url).then(res => res.blob()));

    }
    zip.generateAsync({ type: "blob" })
        .then(function (content) {
            const a = document.createElement("a");
            a.href = URL.createObjectURL(content);
            //local datetime sorted_yyyy_dd_mm
            a.download = zipfilename + ".zip";
            a.click();
            URL.revokeObjectURL(a.href);
        });
}

