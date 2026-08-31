/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("d87pgpfn4rp4g14")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "1yhng4wq",
    "name": "revenue",
    "type": "number",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "noDecimal": false
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "c5blcmo1",
    "name": "closeDate",
    "type": "date",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": "",
      "max": ""
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "w2xqbdln",
    "name": "winLoss",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "open",
        "won",
        "lost"
      ]
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "zsvqevfl",
    "name": "client_id",
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

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("d87pgpfn4rp4g14")

  // remove
  collection.schema.removeField("1yhng4wq")

  // remove
  collection.schema.removeField("c5blcmo1")

  // remove
  collection.schema.removeField("w2xqbdln")

  // remove
  collection.schema.removeField("zsvqevfl")

  return dao.saveCollection(collection)
})
