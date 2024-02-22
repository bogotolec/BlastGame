import { _decorator, Component, instantiate, math, Node, Prefab, SpriteFrame, sys, UITransform } from 'cc';
import { Tile } from './Tile';
const { ccclass, property } = _decorator;

@ccclass('PlayableArea')
export class PlayableArea extends Component {

    @property (Prefab)
    public readonly tilePrefab: Prefab

    @property (SpriteFrame)
    public tileSpriteFrames: SpriteFrame[] = []

    private _height = 10
    private _width = 12
    private _colors = 2
    private _minGroupSize = 2
    private _nodeSize = 1100 / 12

    private _y0 = -535

    private _field = []

    private updateGameSettings() {
        this._height = sys.localStorage.getItem("FieldHeight") || this._height
        this._width = sys.localStorage.getItem("FieldWidth") || this._width
        this._colors = sys.localStorage.getItem("ColorsAmount") || this._colors
        this._minGroupSize = sys.localStorage.getItem("MinGroupSize") || this._minGroupSize

        console.log(sys.localStorage.getItem("FieldHeight"))

        let contentSize = this.node.getComponent(UITransform).contentSize
        this._nodeSize = Math.min(contentSize.x / this._width, contentSize.y / this._height)
        this._y0 = -contentSize.y / 2
    }

    private getPositionFromCoords(x: number, y: number) {
        return [
            (x - this._width / 2  + 0.5) * this._nodeSize,
            this._y0 + (y + 0.5) * (this._nodeSize),
        ]
    }

    private getRandomColor() {
        return Math.floor(Math.random() * this._colors)
    }

    private generateTile() {
        let tile = instantiate(this.tilePrefab)
        let tileComponent = tile.getComponent(Tile)

        let color = this.getRandomColor()
        tileComponent.setColor(color, this.tileSpriteFrames[color])

        tile.setScale(this._nodeSize / 100, this._nodeSize / 100)

        return tile
    }

    private generateField() {
        this.updateGameSettings()

        for (let y = 0; y < this._height; y++) {
            this._field[y] = []
            for (let x = 0; x < this._width; x++) {
                let tile = this.generateTile()

                let [posX, posY] = this.getPositionFromCoords(x, y)

                tile.setPosition(posX, posY)
                tile.parent = this.node

                this._field[y][x] = tile.getComponent(Tile).getColor()
            }
        }
    }

    start() {
        this.generateField()
    }

    update(deltaTime: number) {
        
    }
}


