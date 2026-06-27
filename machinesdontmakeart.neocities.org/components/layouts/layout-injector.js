// initLayout() is called once the DOM (the HTML content of your website) has been loaded.
document.addEventListener("DOMContentLoaded", function () {
    // The following is layout agnostic and loaded into all pages unless opted out
    if (!document.head.classList.contains("opt-out-head-injection"))
        document.head.insertAdjacentHTML("beforeend", pageHead)

    // Load main-layout
    if (document.head.classList.contains("main-layout")) {
        // Inject references
        document.head.insertAdjacentHTML("beforeend", mainLayoutCss)

        // Inserting header and footer:
        document.body.classList.add("main-layout-body") //enforce body layout
        document.body.insertAdjacentHTML("afterbegin", mainLayoutSidebar); // insert sidebar before, because we want header above it... its weird
        document.body.insertAdjacentHTML("afterbegin", mainLayoutHeader);
        document.body.insertAdjacentHTML("beforeend", mainLayoutFooter);

        initActiveLinks();
    }
});

//#region Properties

const pageHref = window.location.href;
const nesting = getNestingString(); // ${nesting} outputs the files depth to get you back to ./machinesdontmakeart.neocities.org/
const pageName = getPageName(); // ${pageName} outputs the folder name for the page, used to collect page css and js

//#endregion Properties

//#region Functions

function initActiveLinks() {
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
function getNestingString() {
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
function getPageName() {
    const currentUrl = window.location.href;
    const pageArray = currentUrl.split("/");

    return pageArray[pageArray.length - 1].replace(".html", "");
}

//#endregion Functions

//#region Layouts

// Insert your header HTML inside these ``. You can use HTML as usual.
const mainLayoutHeader = `
	<div class="main-layout-header">
		Header. Example of how to use the 'active' class to style active links (here: bold):
		<nav>
			<a href="/coding/layout-base-code">homepage</a>
			<a href="/coding/base-code-example/">this page</a>
			<a href="/coding/layout-base-code">other page</a>
			<a href="/coding/layout-base-code">other page</a>
		</nav>
	</div>
`;

// Insert your footer HTML inside these ``. You can use HTML as usual.
// Remove all the content inside the `` if you don't have a footer.
const mainLayoutFooter = `
	<div class="main-layout-footer">
		Footer. Example of how to add an image: 
		<img src="${nesting}/assets/img/layout/divider1.gif" alt="" aria-hidden="true"/>
	</div>
`;

// Insert your sidebar HTML inside these ``. You can use HTML as usual.
// Remove all the content inside the `` if you don't have a sidebar.
const mainLayoutSidebar = `
	<div class="main-layout-sidebar">
    
    </div>
`;

const pageHead = `
    <!--injected head-->
    <!--boilerplate-->
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />

    <!--social media-->
    <meta property="og:url" content="${pageHref}" />
    
    <!--icon-->

    <!--global css-->
    <link href="${nesting}/assets/fonts/fonts.css" rel="stylesheet" type="text/css" media="all" />

    <!--page css-->
    <link href="${nesting}/components/pages/${pageName}/${pageName}.structure.css" rel="stylesheet" type="text/css" media="all" />
    <link href="${nesting}/components/pages/${pageName}/${pageName}.style.css" rel="stylesheet" type="text/css" media="all" />

    <!--page scripts-->
    <script type="module" src="${nesting}/components/pageComponents/${pageName}/${pageName}.js"></script>
`;

const mainLayoutCss = `
    <!--injected main-layout css-->
    <link href="${nesting}/components/layouts/main-layout/main-layout.css" rel="stylesheet" type="text/css" media="all" />
`;

//#endregion Layouts