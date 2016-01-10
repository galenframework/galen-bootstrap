load("../galen-bootstrap/galen-bootstrap.js");

$galen.settings.website = "http://testapp.galenframework.com";
$galen.registerDevice("mobile", inSingleBrowser("mobile emulation", "450x800", ["mobile"]));
$galen.devices.mobile.sizeRange = ["450x500", "599x500"];

$galen.registerDevice("tablet", inSingleBrowser("tablet emulation", "600x800", ["tablet"]));
$galen.devices.tablet.sizeRange = ["600x500", "899x600"];

$galen.registerDevice("desktop", inSingleBrowser("desktop emulation", "1024x768", ["desktop"]));
$galen.devices.desktop.sizeRange = ["900x600", "1200x768"];


testOnAllDevices("Welcome page test", "/", function (driver, device) {
    checkMultiSizeLayout({ 
        driver: driver,
        spec: "specs/homepage.gspec",
        tags: device.tags,
        excludedTags: device.excludedTags,
        sizes: sizeRandomVariations(device.sizeRange, 8)
    });
});

