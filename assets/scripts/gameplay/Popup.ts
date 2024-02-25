import { _decorator, Burst, Button, Color, Component, director, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Popup')
export class Popup extends Component {

    private _label: Label

    public setText(text: string) {
        if (!this._label) this.findLabel()

        this._label.string = text
    }

    public setTextColor(color: Color) {
        if (!this._label) this.findLabel()

        this._label.color = color
    }

    public activate() {
        this.node.active = true
    }

    private findLabel() {
        this._label = this.node.getChildByName("Text").getComponent(Label)
    }

    start() {
        let button = this.node.getChildByName("Button")
        button.on(Button.EventType.CLICK, () => {director.loadScene("menu")})
    }

    update(deltaTime: number) {
        
    }
}


