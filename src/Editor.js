require('leaflet-draw')

require('./Viewer.js')
const EditableLayer = require('./EditableLayer')

L.GeowikiEditor = L.GeowikiViewer.extend({
  initialize (options) {
    L.GeowikiViewer.prototype.initialize(options)

    if (typeof options.sidebar === 'string') {
      this.sidebarDom = document.getElementById(options.sidebar)
    } else {
      this.sidebarDom = document.createElement('div')
    }
    this.sidebarDom.className = 'geowiki-editor-sidebar'
  },

  createLayer (featureGroup) {
    return new EditableLayer(featureGroup)
  },

  currentLayer () {
    if (!this._currentLayer) {
      if (!this.layerTree.length) {
        this.layerTree.push(this.createLayer(this, null))
      }
      return this.layerTree[0]
    }

    return this._currentLayer
  },

  onAdd (map) {
    L.GeowikiViewer.prototype.onAdd(map)

    this.drawControl = new L.Control.Draw({
      draw: {
        polyline: {
          shapeOptions: {}
        },
      },
      edit: {
        featureGroup: this,
        edit: false
      }
    })
    map.addControl(this.drawControl)

    map.on(L.Draw.Event.CREATED, event => {
      let item = this.currentLayer().leafletCreateLayer(event.layer)
      item.edit()

      this.fire('change', event)
    })
    map.on(L.Draw.Event.DRAWSTART, event => this.disableCurrentEditing())
    map.on(L.Draw.Event.EDITED, event => this.fire('change', event))
    map.on(L.Draw.Event.DELETED, event => this.fire('change', event))
   },

  disableCurrentEditing () {
    if (this.currentEdit) {
      this.currentEdit.disableEdit()
      this.currentEdit = null
    }
  },

  save () {
    return this.layerTree.map((layer, i) => {
      return {
        filename: i + '.geojson',
        contents: layer.toGeoJSON()
      }
    })
  }
})

L.geowikiEditor = (options) => {
  return new L.GeowikiEditor(options)
}
