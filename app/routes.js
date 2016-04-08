// Expose routes =========================================================================
module.exports = function(app) {

    // api ---------------------------------------------------------------------
    // Index
    app.get('/', function (req, res) {
        res.sendfile('index.html');
    });

};