load("basics.js");
load("devices.js");

var $galen = {
    settings: {
        website: "http://localhost",
        veryLongWord: "Freundschaftsbezeigungen",
        imageDiffSpecGenerators: {
            "image_diff_validation": function (imagePath) {
                return "image file " + imagePath + ", map-filter denoise 1";
            },
            "image_diff_validation_blur": function (imagePath) {
                return "image file " + imagePath + ", filter blur 4, map-filter denoise 4, analyze-offset 2, error 2%";
            }
        }
    },
    devices: {},

    registerDevice: function (deviceName, device) {
        this.devices[deviceName] = device;
    },

    registerDevices: function (devices) {
        var that = this;
        forMap(devices, function (name, device) {
            that.registerDevice(name, device);
        });
    }
};


function openDriverForDevice(device, url) {
    var fullUrl = null;
    if (url !== null) {
        if (url.indexOf("http://") !== 0 && url.indexOf("https://") !== 0) {
            fullUrl = $galen.settings.website;
            if (url.indexOf("/") !== 0) {
                fullUrl += "/";
            }
            fullUrl += url;
        } else {
            fullUrl = url;
        }
    }
    else {
        fullUrl = $galen.settings.website;
    }
    if (fullUrl !== null) {
        session.report().info("Open " + fullUrl);
    }
    var driver = device.initDriver(fullUrl);
    return driver;
}


afterTest(function (test) {
    var device = session.get("device");
    if (device != null) {
        if (test.isFailed()) {
            try {
                session.report().info("Screenshot & Page source")
                    .withAttachment("screenshot.png", takeScreenshot(device.driver))
                    .withTextAttachment("page-source.txt", device.driver.getPageSource())
                    .withExtrasLink("Location", device.driver.getCurrentUrl());
            } catch (ex) {
                session.report().warn("Couldn't retrieve page information: " + ex);
            }
        }
        device.quit();
    }
});

function _test(testNamePrefix, url, callback) {
    test(testNamePrefix + " on ${deviceName} device", function (device) {
        session.put("device", device);
        var driver = openDriverForDevice(device, url);
        callback.call(this, driver, device);
    });
}

function testOnAllDevices(testNamePrefix, url, callback) {
    forAll($galen.devices, function () {
        _test(testNamePrefix, url, callback);
    });
}

function testOnDevice(device, testNamePrefix, url, callback) {
    forOnly(device, function() {
        _test(testNamePrefix, url, callback);
    });
}

function checkRandomSizeLayout(driver, spec, tags, excludedTags, widthRange, iterationAmount) {
    var sizes = [];
    var widthStart = widthRange[0];
    var widthEnd = widthRange[1];
    var widthDelta = widthEnd - widthStart;
    if (iterationAmount > widthDelta) {
        iterationAmount = widthDelta;
    }

    if (iterationAmount < 1) {
        throw new Error("Amount of iterations should be greater than 0");
    }

    var iterationDelta = Math.max(Math.round(widthDelta / iterationAmount), 1);

    for (var i = 0; i < iterationAmount; i++) {
        var size = Math.round(widthStart + i * iterationDelta + Math.floor(Math.random() * iterationDelta));
        logged("Resizing to width " + size, function () {
           resize(driver, size + "x700");
           checkLayout(driver, spec, tags, excludedTags);
        });
    }
}


/**
 * Used for testing layout when long words are used on major elements
 * This will only work in galen 2.2+
 */
function checkLongWordsLayout(driver, spec, tags, excludedTags, groupName) {
    groupName = groupName || "long_word_test";
    var pageSpec = parsePageSpec({
        driver: driver, 
        spec: spec
    });

    logged("Replace text in major elements to a single long word", function (report) {
        var longWordsObjects = pageSpec.findObjectsInGroup(groupName);
        for (var i = 0; i < longWordsObjects.size(); i++) {
            report.info("Changing element " + longWordsObjects.get(i));

            var locator = pageSpec.getObjects().get(longWordsObjects.get(i));
            if (locator !== null) {
                var webElement = GalenUtils.findWebElement(driver, locator);
                driver.executeScript("var element = arguments[0]; element.innerHTML=\"" + $galen.settings.veryLongWord + "\";", webElement);
            }
        }
    });

    checkLayout(driver, spec, tags, excludedTags);
}


/**
 * Will only work with galen 2.2+
 */
function checkImageDiff (storage, driver, spec, specGenerators) {
    specGenerators = specGenerators || $galen.settings.imageDiffSpecGenerators;

    if (!fileExists(storage)) {
        makeDirectory(storage);
    }

    var iterationDirs = listDirectory(storage);

    var currentIteration = 0;

    if (iterationDirs.length > 0) {
        iterationDirs.sort( function (a, b) {
            var aInt = parseInt(a) || 0;
            var bInt = parseInt(b) || 0;
            return aInt - bInt;
        });
        var selectedFolder = iterationDirs[iterationDirs.length - 1];
        currentIteration = parseInt(selectedFolder);

        var pageSpec = parsePageSpec({
            driver: driver, 
            spec: spec
        });
        pageSpec.clearSections();

        var totalObjects = 0;

        for (var imageDiffGroup in specGenerators) {
            if (specGenerators.hasOwnProperty(imageDiffGroup)) {
                var imageDiffObjects = GalenUtils.listToArray(pageSpec.findObjectsInGroup(imageDiffGroup));

                totalObjects += imageDiffObjects.length;

                for (var i = 0; i < imageDiffObjects.length; i++) {
                    pageSpec.addSpec("Image Diff Validation", 
                        imageDiffObjects[i], 
                        specGenerators[imageDiffGroup](storage + "/" + selectedFolder + "/objects/" + imageDiffObjects[i] + ".png")
                    );
                }
            }
        }

        if (totalObjects === 0) {
            throw new Error("Couldn't find any objects for " + imageDiffGroup + " group");
        }

        logged("Verifying image diffs with #" + selectedFolder + " iteration", function () {
            checkPageSpecLayout(driver, pageSpec);
        });
    }
        
    currentIteration += 1;
    var iterationPath = storage + "/" + currentIteration;

    logged("Creating page dump to " + iterationPath, function () {
        dumpPage({
            driver: driver,
            spec: spec,
            exportPath: iterationPath,
            onlyImages: true,
            excludedObjects: ["screen", "viewport"]
        });
    });

    if (iterationDirs.length == 0) {
        throw new Error("Couldn't find any previous iterations");
    }
}


/*
    Exporting functions to all other tests that will use this script
*/
(function (export) {
    export.$galen = $galen;
    export.testOnAllDevices = testOnAllDevices;
    export.testOnDevice = testOnDevice;
    export.checkLongWordsLayout = checkLongWordsLayout;
    export.checkImageDiff = checkImageDiff;
    export.checkRandomSizeLayout = checkRandomSizeLayout;
})(this);
