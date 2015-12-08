function forMap(map, callback) {
    if (map !== undefined && map !== null) {
        for (var key in map) {
            if (map.hasOwnProperty(key)) {
                callback(key, map[key]);
            }
        }
    }
}

function copyProperties(dest, source) {
    forMap(source, function (name, value) {
        dest[name] = value;
    });
}

