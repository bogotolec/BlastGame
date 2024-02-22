import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Tile')
export class Tile extends Component {

    private color = 0

    public getColor() {
        return this.color
    }

    public setColor(color: number, spriteFrame: SpriteFrame) {
        this.color = color

        let sprite = this.node.getChildByName("Image").getComponent(Sprite)
        sprite.spriteFrame = spriteFrame
    }

    start() {

    }

    update(deltaTime: number) {
        
    }
}


