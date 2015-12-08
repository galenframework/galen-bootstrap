load("galen-bootstrap/galen-bootstrap.js");

$galen.settings.website = "http://testapp.galenframework.com";
$galen.registerDevice("mobile", inSingleBrowser("mobile emulation", "450x800", ["mobile"]));
$galen.devices.mobile.sizeRange = [450, 599];

$galen.registerDevice("tablet", inSingleBrowser("tablet emulation", "600x800", ["tablet"]));
$galen.devices.tablet.sizeRange = [600, 899];

$galen.registerDevice("desktop", inSingleBrowser("tablet emulation", "1024x768", ["desktop"]));
$galen.devices.desktop.sizeRange = [900, 1200];


testOnAllDevices("Welcome page test", "/", function (driver, device) {
    checkRandomSizeLayout(driver, "homepage.gspec", device.tags, device.excludedTags, device.sizeRange, 8);
});

