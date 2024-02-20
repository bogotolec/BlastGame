import { _decorator, Component, Button, Node, Label, input, Input } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SyncElementWithButton')
export class SyncElementWithButton extends Component {
    
    @property ({type: Button})
    public button: Button

    start() {
        let label = this.node.getComponent(Label)

        let hoverColor = this.button.hoverColor.multiply(label.color)
        let pressedColor = this.button.pressedColor.multiply(label.color)
        let normalColor = label.color.clone() 

        let isHovered = false
        let isPressed = false
        let isReHovered = false

        let updateColor = () => {
            if (isHovered && isPressed) {
                label.color = pressedColor
            }
            else if (isHovered && !isReHovered) {
                label.color = hoverColor
            }
            else {
                label.color = normalColor
            }
        }

        let onHoverBegin = () => {
            isHovered = true
            isReHovered = isPressed // This is made to mimic cocos' behaviour
            updateColor()
        }

        let onHoverEnd = () => {
            isHovered = false
            updateColor()
        }

        let onPressBegin = () => {
            isPressed = true
            updateColor()
        }

        let onPressEnd = () => {
            isPressed = false
            updateColor()
        }

        this.button.node.on(Node.EventType.MOUSE_ENTER, onHoverBegin)
        this.button.node.on(Node.EventType.MOUSE_LEAVE, onHoverEnd)

        this.button.node.on(Node.EventType.TOUCH_START, onPressBegin)
        this.button.node.on(Node.EventType.MOUSE_DOWN, onPressBegin)

        this.button.node.on(Node.EventType.TOUCH_CANCEL, onPressEnd)
        this.button.node.on(Node.EventType.TOUCH_END, onPressEnd)
        this.button.node.on(Node.EventType.MOUSE_UP, onPressEnd)


        input.on(Input.EventType.MOUSE_UP, onPressEnd)
        input.on(Input.EventType.TOUCH_CANCEL, onPressEnd)
        input.on(Input.EventType.TOUCH_END, onPressEnd)
    }

    update(deltaTime: number) {

    }
}


