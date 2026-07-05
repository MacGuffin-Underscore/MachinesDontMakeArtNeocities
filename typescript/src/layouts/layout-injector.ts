import fs from 'fs'

// initLayout() is called once the DOM (the HTML content of your website) has been loaded.
document.addEventListener("DOMContentLoaded", async function () {
    var insertAtElement: HTMLElement = document.body;

    // These may not work
    //document.head.textContent = document.head.textContent.replace("{nesting}", pageNesting);
    //document.body.textContent = document.body.textContent.replace("nesting", pageNesting);

    // The following is layout agnostic and loaded into all pages unless opted out
    if (!headClasslist.contains("opt-out-head-injection")) {
        document.head.insertAdjacentHTML("beforeend", globalHead);
    }

    if (!headClasslist.contains("opt-out-global-template")) {
        insertAtElement = await injectLayout("global-layout", insertAtElement, "global-content");
    }

    // Load main-layout
    for (let i = 0; i < headClasslist.length; i++) {
        if (validLayouts.indexOf(headClasslist[i]) > -1)
            insertAtElement = await injectLayout(headClasslist[i], insertAtElement, "content-container");
    }

    // do this thing, idk
    initActiveLinks();
});

//#region Properties

const headClasslist: DOMTokenList = document.head.classList;
const validLayouts: string[] = ["main-layout"];
const pageHref: string = window.location.href;
const pageNesting: string = getNestingString(); // ${nesting} outputs the files depth to get you back to ./machinesdontmakeart.neocities.org/
const pageName: string = getPageName(); // ${pageName} outputs the folder name for the page, used to collect page css and js

//#endregion Properties

//#region Functions

function initActiveLinks(): void {
    // This function adds the class "active" to any link that links to the current page.
    // This is helpful for styling the active menu item.

    const pathname = window.location.pathname;
    [...document.querySelectorAll("a")].forEach((el) => {
        const elHref = el
            .getAttribute("href")
            .replace(".html", "")
            .replace("/public", "");

        if (pathname == "/") {
            // homepage
            if (elHref == "/" || elHref == "/index.html") el.classList.add("active");
        } else {
            // other pages
            if (window.location.href.includes(elHref)) el.classList.add("active");
        }
    });
}

/// Gets the number of files deep your current page is
function getNestingString(): string {
    const currentUrl = window.location.href
        .replace("http://", "")
        .replace("https://", "")
        .replace("/public/", "/");
    const numberOfSlahes = currentUrl.split("/").length - 1;
    if (numberOfSlahes == 1) return ".";
    if (numberOfSlahes == 2) return "..";
    return ".." + "/..".repeat(numberOfSlahes - 3);
}

/// Gets the current page name, used to inject page css and scripts that follow the proper naming conventions
function getPageName(): string {
    const currentUrl = window.location.href;
    const pageArray = currentUrl.split("/");

    return pageArray[pageArray.length - 1]?.replace(".html", "");
}

// Gets the head to add to the page for any layouts used
function getLayoutHeadCss(pageLayout: string): string {
    return `
    <!--layout => ${pageLayout}-->
    <link href="${pageNesting}/components/layouts/pageLayouts/${pageLayout}/${pageLayout}.css" rel="stylesheet" type="text/css" media="all" />
    `;
}

// injects a layout from ./{page-layout}/{page-layout}.html into the body at the parent element, then sets a new parent element for further nesting
async function injectLayout(pageLayout: string, parentElement: HTMLElement, newParentID: string): Promise<HTMLElement> {
    if (parentElement === undefined || parentElement === null) {
        document.body.insertAdjacentHTML("beforeend",
            `<p>Unable to insert template '${pageLayout}' into element ID '${parentElement}'</p>`); return;
    }

    var newParentElement: HTMLElement;

    // Inject head references
    document.head.insertAdjacentHTML("beforeend", getLayoutHeadCss(pageLayout))

    await fetch(`${pageNesting}/components/layouts/pageLayouts/${pageLayout}/${pageLayout}.html`)
        .then(response => {
            // When the page is loaded convert it to text
            return response.text();
        })
        .then(html => {
            // Initialize the DOM parser
            const parser = new DOMParser();

            // Set any sources to their proper nested value
            html = html.replaceAll("{nesting}", pageNesting);

            // Parse the text
            const doc = parser.parseFromString(html, "text/html");

            // You can now even select part of that html as you would in the regular DOM
            // Example:
            // const docArticle = doc.querySelector('article').innerHTML
            console.log(doc);

            const layoutElements = doc.querySelectorAll('body > *')
            const layoutElementLength = layoutElements.length;

            for (let i = 0; i < layoutElementLength; i++) {
                parentElement.insertAdjacentElement("afterbegin", layoutElements[i])
            }

            const newParentCheck = document.getElementById(newParentID);

            if (newParentCheck != null && newParentID != "") {
                newParentElement = newParentCheck;
            }
        })
        .catch(error => {
            console.error('Failed to fetch page: ', error)
        });

    return newParentElement;
}


//#endregion Functions

//#region Layouts

// boilerplate head information that goes into (almost) any page
const globalHead: string = `
    <!--boilerplate-->
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />

    <!--social media-->
    <meta property="og:url" content="${pageHref}" />
    
    <!--icon-->
    <link rel="icon" type="image/x-icon" href="${pageNesting}/assets/img/logo/symbol.svg">

    <!--global css-->
    <link href="${pageNesting}/components/globalCss/global.css" rel="stylesheet" type="text/css" media="all" />

    <!--page css-->
    <link href="${pageNesting}/components/pages/${pageName}/${pageName}.structure.css" rel="stylesheet" type="text/css" media="all" />
    <link href="${pageNesting}/components/pages/${pageName}/${pageName}.style.css" rel="stylesheet" type="text/css" media="all" />

    <!--page scripts-->
    <script type="module" src="${pageNesting}/components/pageComponents/${pageName}/${pageName}.js"></script>
`;

//#endregion Layouts