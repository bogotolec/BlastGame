import { _decorator, Button, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SettingsExitButton')
export class SettingsExitButton extends Component {
    @property (Node)
    public readonly currentFrame: Node

    @property (Node)
    public readonly newFrame: Node

    private onButtonClick(this) {
        this.currentFrame.active = false
        this.newFrame.active = true
    }

    start() {
        let button = this.node.getComponent(Button)
        button.node.on(Button.EventType.CLICK, this.onButtonClick, this)
    }

    update(deltaTime: number) {
        
    }
}


