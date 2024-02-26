import { _decorator, Color, Component, Node, Sprite, SpriteFrame, Tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Tile')
export class Tile extends Component {

    private color = 0

    private _highlightedColor = new Color(192, 192, 192)
    private _defaultColor = new Color(255, 255, 255)

    public x = 0
    public y = 0
    public isFalling = false
    public spawnTime = 0
    public tween: Tween<Node> | null = null

    public getColor() {
        return this.color
    }

    public setColor(color: number, spriteFrame: SpriteFrame) {
        this.color = color

        let sprite = this.node.getChildByName("Image").getComponent(Sprite)
        sprite.spriteFrame = spriteFrame
    }

    public highlight() {
        let sprite = this.node.getChildByName("Image").getComponent(Sprite)
        sprite.color = this._highlightedColor
    }

    public unhighlight() {
        let sprite = this.node.getChildByName("Image").getComponent(Sprite)
        sprite.color = this._defaultColor
    }

    public mark() {
        let marker = this.node.getChildByName("Marker")
        marker.active = true
    }

    public unmark() {
        let marker = this.node.getChildByName("Marker")
        marker.active = false
    }

    start() {

    }

    update(deltaTime: number) {
        
    }
}


