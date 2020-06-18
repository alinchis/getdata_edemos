// get indexes list

// import libraries
const { chromium: chrome } = require('playwright');  // Or 'chromium' or 'webkit'.

// ////////////////////////////////////////////////////////////////////////////
// // METHODS

// /////////////////////////////////////////////////////////////////////
// get child by frame name
async function getChildFrameByName(frame, name) {
    const frameName = await frame.name();

    if (frameName === name) {
        return frame;
    }
    for (const child of frame.childFrames()) {
        const resFrame = await getChildFrameByName(child, name);
        if (resFrame) return resFrame;
    }
};

// /////////////////////////////////////////////////////////////////////
// get home html
function getHomePage() {
    (async () => {
        const browser = await chrome.launch({ headless: false });
        const page = await browser.newPage();
        await page.goto('http://edemos.insse.ro/portal/');
        await page.waitForNavigation("wcnav_defaultSelection");
        await page.click('text=Acces');

        await sleep(10);
        const childFrames = page.frames();

        let frameIndicatori;
        while (!frameIndicatori) {
            frameIndicatori = await getChildFrameByName(page.mainFrame(), 'pt1:portlet1::_iframe');
            if (frameIndicatori) {
                break;
            }
            sleep(1);
        }

        await frameIndicatori.waitForSelector('text=Tip indicatori');
        const selectBoxes = await frameIndicatori.$$('.af_selectOneListbox_content', (el) => el);
        for (const sb of selectBoxes){
            const html = await sb.innerHTML();
            console.log(`==============`, html);
        }
        await page.screenshot({ path: 'edemos.png' });

        await browser.close();

        async function getChildFrameByName(frame, name) {
            const frameName = await frame.name();

            if (frameName === name) {
                return frame;
            }
            for (const child of frame.childFrames()) {
                const resFrame = await getChildFrameByName(child, name);
                if (resFrame) return resFrame;
            }
        }
    })();

    function sleep(seconds) {
        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    }
}


// /////////////////////////////////////////////////////////////////////////////
// // EXPORTS
module.exports = () => {
    getHomePage();
}
