'use strict'

const fs = require('fs')
const path = require('path')
const databaseConnection = require('../../setup/databaseConnection')
const basename = path.basename(__filename)
const models = {}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js')
  })
  .forEach(file => {
    const Model = databaseConnection['import'](path.join(__dirname, file))
    models[Model.name] = new Model()
  })

Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate()
  }
})

models.sequelize = databaseConnection

module.exports = models
