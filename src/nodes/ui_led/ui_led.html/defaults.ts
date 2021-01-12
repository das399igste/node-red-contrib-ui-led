import { NodePropertiesDef } from '@node-red/editor-client'
import { EditorRED } from 'node-red'
import { GroupNodeDef } from '../../../types/node-red-dashboard'
import { ColorForValueArray } from '../shared/types'
import { LEDEditorNodeInstance, LEDEditorNodeProperties } from './types'

export const colorForValueDefault: ColorForValueArray = [
  {
    color: 'red',
    value: false,
    valueType: 'bool'
  },
  {
    color: 'green',
    value: true,
    valueType: 'bool'
  }
]

const validateWidthFactory = (RED: EditorRED) => {
  return function (this: LEDEditorNodeInstance, newValue: string): boolean {
    const width = parseInt(newValue, 10) || 0
    const currentGroup = $('#node-input-group').val()?.toString() || '' //|| this.group
    const groupNode = RED.nodes.node(currentGroup) as GroupNodeDef
    const fitsInGroup = !groupNode || +width <= +groupNode.width
    const fitsWithLabel = !this.label || width > 1 || width == 0
    const valid = fitsInGroup && fitsWithLabel
    $('#node-input-size').toggleClass('input-error', !valid)
    $('#node-input-label').toggleClass('input-error', !fitsWithLabel)
    return valid
  }
}

const validateLabel = function (
  this: LEDEditorNodeInstance,
  newValue: string
): boolean {
  const fitsWithWidth = (() => {
    if (newValue) {
      return true
    }
    if (typeof this.width === 'undefined') {
      return false
    }
    return this.width > 1 || this.width == 0
  })()
  const valid = fitsWithWidth
  $('#node-input-label').toggleClass('input-error', !valid)
  $('#node-input-size').toggleClass('input-error', !fitsWithWidth)
  return valid
}

const validateColorForValueFactory = (RED: EditorRED) => {
  return function (
    this: LEDEditorNodeInstance,
    newValue: string | ColorForValueArray
  ): boolean {
    let useNewValue: ColorForValueArray
    if (typeof newValue === 'string') {
      useNewValue = JSON.parse(newValue)
    } else {
      useNewValue = newValue
    }
    // TODO: check for duplicate values
    for (let index = 0; index < useNewValue.length; index++) {
      const colorForValue = useNewValue[index]
      if (!colorForValue.color || colorForValue.color.length === 0) {
        return false
      }
      // We're allowing undefined as a valid value
      // if (colorForValue.value === undefined) {
      //     return false;
      // }
      if (!colorForValue.valueType) {
        // || colorForValue.color.valueType === 0) {
        return false
      }
      if (!RED.validators.typedInput(colorForValue.valueType)) {
        console.log('Typed', colorForValue.valueType)
        return false
      }
    }
    return true
  }
}

export const defaultsFactory = (
  RED: EditorRED
): NodePropertiesDef<LEDEditorNodeProperties> => {
  return {
    order: { value: 0 },
    group: { value: 'ui_group', type: 'ui_group', required: true },
    width: {
      value: 0,
      validate: validateWidthFactory(RED)
    },
    height: { value: 0 },
    label: {
      value: '',
      validate: validateLabel
    },
    labelPlacement: { value: 'left' },
    labelAlignment: { value: 'left' },

    colorForValue: {
      required: true,
      // TODO: switch to object sorted by value
      value: colorForValueDefault,
      validate: validateColorForValueFactory(RED)
    },
    allowColorForValueInMessage: { value: false },

    name: { value: '' }
  }
}
