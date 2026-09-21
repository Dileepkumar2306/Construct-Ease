let app;
let loadError = null;

try {
    app = require('../server/server.js');
} catch (err) {
    loadError = err;
    console.error('[API Init Error]:', err);
}

module.exports = (req, res) => {
    if (loadError) {
        return res.status(500).json({
            error: 'Server initialization failed',
            message: loadError.message,
            stack: loadError.stack
        });
    }
    return app(req, res);
};
