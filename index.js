var spawn = require('child_process').spawn,
    fs = require('fs');
var FunctionalShell = function(shFunction, args) {
    args = [].concat(args);
    var events = {};
    var result = {
        on: function(ev, callback) {
            if (typeof callback === 'function') {
                events[ev] = callback;
            }
        }
    };

    var parsedScript = FunctionalShell.parse(shFunction);
    if (!parsedScript) {
        result.on = function(ev, callback) {
            if (ev == 'error') {
                callback(new Error('invalid shFunc'));
            }
        };
        return result;
    }
    var tmpDirName = __dirname + "/tmp";
    var tmpShName = tmpDirName + "/" + Date.now() + ".sh";
    var mode = {
        mode: 493
    };

    function errorReport(err) {
        if (err && events.error) {
            events.error(err);
        }
    }
    fs.lstat('./tmp', function(err, stats) {
        if (err) {
            errorReport(err);
            return;
        }
        if (!stats || !stats.isDirectory()) {
            errorReport(new Error("invalid tmp Directory"));
            return;
        }
        fs.writeFile(tmpShName, parsedScript, mode, function(err) {
            if (err) {
                errorReport(err);
                return;
            }
            var process = spawn(tmpShName, args);

            process.stdout.on('data', function(data) {
                if (events.stdout) {
                    events.stdout(data);
                }
            });

            process.stderr.on('data', function(data) {
                if (events.stderr) {
                    events.stderr(data);
                }
            });


            process.on('close', function(data) {
                fs.unlink(tmpShName, function(err) {
                    errorReport(err);
                    if (events.close) {
                        events.close(data);
                    }
                });
            });
            process.on('error', errorReport);

        });
    });

    return result;
};

FunctionalShell.parse = function parse(shFunction) {
    var match = shFunction.toString().match(/\/\*([.\n\s\S]*)\*\//);
    if (match) {
        return match[1].replace(/\n\s*/g, '\n').trim();
    }
    return null;
}
module.exports = FunctionalShell;