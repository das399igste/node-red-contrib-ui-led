import { NodeInitializer } from 'node-red'
import {
  GroupNodeInstance,
  NodeRedUI,
} from '../../types/node-red-dashboard'

import { beforeEmitFactory, initController } from './processing'
import { HTML, ledStyle } from './rendering'
import { LEDNode, LEDNodeDef } from './types'
import { checkConfig, mapColorForValue, nodeToStringFactory } from './utility'

const nodeInit: NodeInitializer = (RED): void => {
  function LEDNodeConstructor(this: LEDNode, config: LEDNodeDef): void {
    try {
      const NodeREDDashboard = RED.require('node-red-dashboard')
      if (!NodeREDDashboard) {
        throw new Error(
          'Node-RED dashboard is a peer requirement of this library, please install it via npm or in the palette panel.'
        )
      }

      RED.nodes.createNode(this, config)

      if (!checkConfig(config, this, RED)) {
        return
      }

      this.colorForValue = mapColorForValue(this, config.colorForValue, RED)
      this.allowColorForValueInMessage = config.allowColorForValueInMessage
      this.toString = nodeToStringFactory(config)

      // TODO: support theme and dark
      const ui: NodeRedUI = NodeREDDashboard(RED)

      const groupNode = RED.nodes.getNode(config.group) as GroupNodeInstance

      const width =
        config.width || (config.group && groupNode.config.width) || undefined
      const height = config.height || 1

      const format = HTML(config, ledStyle('gray', false))

      const done = ui.addWidget({
        node: this,
        width,
        height,

        format,

        templateScope: 'local',
        order: config.order,

        group: config.group,

        emitOnlyNewValues: false,

        beforeEmit: beforeEmitFactory(this, RED),

        initController
      })

      this.on('close', done)
    } catch (error) {
      console.log(error)
    }
  }

  RED.nodes.registerType('ui_led', LEDNodeConstructor)
}

export = nodeInit
