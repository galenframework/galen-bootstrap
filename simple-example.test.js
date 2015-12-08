load("galen-bootstrap/galen-bootstrap.js");

$galen.settings.website = "http://testapp.galenframework.com";
$galen.registerDevice("mobile", inSingleBrowser("mobile emulation", "450x800", ["mobile"]));
$galen.registerDevice("tablet", inSingleBrowser("tablet emulation", "600x800", ["tablet"]));
$galen.registerDevice("desktop", inSingleBrowser("tablet emulation", "1024x768", ["desktop"]));

testOnAllDevices("Welcome page test", "/", function (driver, device) {
    checkLayout(driver, "homepage.gspec", device.tags, device.excludedTags);
});
