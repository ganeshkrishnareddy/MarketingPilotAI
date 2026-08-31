/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("_pb_users_auth_")

  collection.listRule = "@request.auth.role = \"admin\" || id = @request.auth.id"
  collection.viewRule = "@request.auth.role = \"admin\" || id = @request.auth.id"
  collection.createRule = "@request.auth.role = \"admin\""
  collection.updateRule = "@request.auth.role = \"admin\" || id = @request.auth.id"
  collection.deleteRule = "@request.auth.role = \"admin\""

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "va43h3zs",
    "name": "role",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "admin",
        "client"
      ]
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "suteywmz",
    "name": "status",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "active",
        "inactive"
      ]
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "tzivz0fg",
    "name": "client_of",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "_pb_users_auth_",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "bxbib5gv",
    "name": "business",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "cor8t3puuz760y7",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("_pb_users_auth_")

  collection.listRule = "id = @request.auth.id"
  collection.viewRule = "id = @request.auth.id"
  collection.createRule = ""
  collection.updateRule = "id = @request.auth.id"
  collection.deleteRule = "id = @request.auth.id"

  // remove
  collection.schema.removeField("va43h3zs")

  // remove
  collection.schema.removeField("suteywmz")

  // remove
  collection.schema.removeField("tzivz0fg")

  // remove
  collection.schema.removeField("bxbib5gv")

  return dao.saveCollection(collection)
})
