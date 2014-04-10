functional-shell
================

```javascript:sample.js
var echo = function() {
    /*
    #!/bin/sh
    echo $1
    */
};

var process = sh(echo, ["hello"]);
process.on('stdout', function(data) {
    console.log(data.toString()); // hello\n
});
process.on('stderr', function(data) {
    console.error(data);
});
process.on('error', function(err) {
    throw err;
});
process.on('close', function(data) {
    console.log(data); // 0 finish status code
});
```
