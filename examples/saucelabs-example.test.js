load("../galen-bootstrap/galen-bootstrap.js");


$galen.settings.website = "http://testapp.galenframework.com";
$galen.registerDevices(loadGridDevices("saucelabs-devices.json", "http://localhost"));


testOnDevice($galen.devices.saucelabs_htcOneX, 
    "Home page", "/", function (driver, device) {
    checkLayout(driver, "homepage.gspec", device.tags, device.excludedTags);
});



testOnDevices([
    $galen.devices.saucelabs_googleNexus7C,
    $galen.devices.saucelabs_Windows_10_IE11
], "Home page", "/", function (driver, device) {
    checkLayout(driver, "homepage.gspec", device.tags, device.excludedTags);
});
