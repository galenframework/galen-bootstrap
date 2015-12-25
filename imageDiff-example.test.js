load("galen-bootstrap/galen-bootstrap.js");

$galen.settings.website = "http://testapp.galenframework.com";
$galen.registerDevice("mobile", inSingleBrowser("mobile emulation", "450x800", ["mobile"]));
$galen.registerDevice("tablet", inSingleBrowser("tablet emulation", "800x800", ["mobile"]));
$galen.registerDevice("desktop", inSingleBrowser("desktop emulation", "800x800", ["mobile"]));

testOnAllDevices("Welcome page test", "/", function (driver, device) {
    checkImageDiff({
        driver: driver, 
        storage: "image-diff/welcome-page-" + device.deviceName, 
        spec: "homepage.gspec"
    });
});
