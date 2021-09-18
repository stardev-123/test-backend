const publicRoutes = require('./public')
const privateRoutes = require('./private')
// const adminRoutes = require('./admin')
// const apiRoutes = require('./api');
// const testRoutes = require('./test')
// const auth = require('./../middleware/authMiddleware')
const logger = require('../lib/logger')
const config = require('../config')

module.exports = (app) => {
  logger.system(null, 'attaching routes')
  app.use(publicRoutes)
  // if (config.env !== 'prod') app.use('/test', testRoutes)
  // app.use('/user/:userId', auth.checkUserToken, privateRoutes)
  app.use('/user', privateRoutes)
  // app.use('/admin', auth.checkAdminAuth, adminRoutes)
  // app.use('/api', auth.checkAPIToken, apiRoutes);
}
