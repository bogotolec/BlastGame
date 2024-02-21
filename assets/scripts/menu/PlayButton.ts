import { _decorator, Button, Component, director, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlayButton')
export class PlayButton extends Component {

    private changeScene() {
        director.loadScene("gameplay")
    }

    start() {
        let button = this.node.getComponent(Button)
        button.node.on(Button.EventType.CLICK, this.changeScene)
    }

    update(deltaTime: number) {
        
    }
}


