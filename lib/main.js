const XUL = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
var window = require("sdk/window/utils");
var {observer} = require("sdk/keyboard/observer");
var {URL} = require('sdk/url');
var tabs = require('sdk/tabs');



const boxID = "identity-boxi";

const amazonSite = "amazon.de"

function checkSearchBox(event, url)  {

    if(!hasCurrentWindowSearchBox() && url.indexOf(amazonSite) > -1) {
        createSearchBox(url);
        event.preventDefault();
    }
}

function createSearchBox(url) {
    let origInput = gURLBar.mInputField;
    enhancedURLBar = currentWindow.document.createElementNS(XUL, "hbox");
    origInput.parentNode.insertBefore(enhancedURLBar, origInput);

    enhancedURLBar.setAttribute("id", boxID); // TODO: outsource functionality in own CSS file
    enhancedURLBar.setAttribute("class", "verifiedIdentity");
    enhancedURLBar.setAttribute("align", "center");
    enhancedURLBar.setAttribute("style", "color: blue")

    var label = currentWindow.document.createElementNS(XUL, "label");
    label.setAttribute("id", "identity-icon-label");
    label.setAttribute("class", "plain");
    label.setAttribute("flex", "1");
    label.setAttribute("crop", "end");
    label.setAttribute("value", amazonSite + " durchsuchen:");

    gURLBar.value = "";

    enhancedURLBar.appendChild(label);
}

function hasCurrentWindowSearchBox() {
    var enhancedURLBar = currentWindow.document.getElementById(boxID)
    return enhancedURLBar;
}

function removeWindowSearchBox() {
    var enhancedURLBar = hasCurrentWindowSearchBox();
    if (enhancedURLBar) {
        //enhancedURLBar.style.visibility = "hidden"; // TODO check if hide or remove!
        enhancedURLBar.remove();
    }
}


var currentWindow;
var gURLBar;
observer.on("keydown", function(event) {
    // Ignore events that have been handled elsewhere (e.g. by the web page)
    if (event.defaultPrevented)
        return;

    currentWindow = window.getMostRecentBrowserWindow();
    gURLBar = currentWindow.document.getElementById("urlbar");
    if(gURLBar.focused === true) {
        var url = gURLBar.value;
        if (event.keyCode === 9) { // Tab pressed TODO: Ensure tab was pressed while urlbar was selected DONE
            checkSearchBox(event, url);

            // TODO store current tab and hide search box if user switches to other tab
        } else if (event.keyCode === event.DOM_VK_ESCAPE || (event.keyCode === event.DOM_VK_BACK_SPACE && url.length === 0)) {// TODO check if ESC to abort makes sense
            removeWindowSearchBox();
        } else if (event.keyCode === event.DOM_VK_RETURN && hasCurrentWindowSearchBox()) {
            var amazonURL = "http://www.amazon.de/exec/obidos/external-search/?field-keywords=%s&mode=blended";
            var searchURL;
            if(url.length > 0) {
                searchURL = amazonURL.replace("%s", url); // TODO string encoding!
            } else {
                searchURL = amazonSite;
            }
            gURLBar.value = searchURL;
            removeWindowSearchBox();
        }
    }
});