
const checkRole = (requiredRole) => {
    return (req, res, next) => {
        const userRole = req.headers['x-user-role'];

        if (!userRole) {
            return res.status(401).json({ message: "Header x-user-role diperlukan" });
        }

        if (requiredRole === 'admin' && userRole !== 'admin') {
            return res.status(403).json({ message: "Akses ditolak. Butuh role Admin." });
        }

        if (requiredRole === 'user' && userRole !== 'user') {
            return res.status(403).json({ message: "Akses ditolak. Butuh role User." });
        }

        next();
    };
};

module.exports = { checkRole };