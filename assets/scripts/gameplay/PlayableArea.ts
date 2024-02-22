import { _decorator, Component, EventMouse, instantiate, math, Node, Prefab, SpriteFrame, sys, UITransform } from 'cc';
import { Tile } from './Tile';
import { Queue } from '../utils/Queue';
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

    private _field: Tile[][] = []

    private updateGameSettings() {
        this._height = sys.localStorage.getItem("FieldHeight") || this._height
        this._width = sys.localStorage.getItem("FieldWidth") || this._width
        this._colors = sys.localStorage.getItem("ColorsAmount") || this._colors
        this._minGroupSize = sys.localStorage.getItem("MinGroupSize") || this._minGroupSize

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

    private readonly _groupDirections = [
        [-1, 0],
        [0, -1],
        [1, 0],
        [0, 1],
    ]

    private getGroup(this, x: number, y: number) {
        let result: [number, number][] = []

        let desiredColor = this._field[y][x].getColor()

        let visited: boolean[][] = []
        visited[y] = []
        visited[y][x] = true

        let queue = new Queue<[number, number]>()
        queue.enqueue([x, y])

        while (queue.size() > 0) {
            let [curX, curY] = queue.dequeue()
            result.push([curX, curY])

            this._groupDirections.forEach(([diffX, diffY]) => {
                let newX = curX + diffX, newY = curY + diffY

                if (this._field[newY] && this._field[newY][newX] && this._field[newY][newX].getColor() == desiredColor &&
                    !(visited[newY] && visited[newY][newX])) {
                    queue.enqueue([newX, newY])

                    if (!visited[newY]) {
                        visited[newY] = []
                    }
                    visited[newY][newX] = true
                }
            })
        }

        return result
    }

    private onHover(this, event: EventMouse) {
        let tile = event.target.getComponent(Tile)
        let x = tile.x, y = tile.y

        let group = this.getGroup(x, y)
        if (group.length >= this._minGroupSize) {
            group.forEach(([x, y]) => {
                this._field[y][x].highlight()
            })
        }
    }

    private onHoverEnd(this, event: EventMouse) {
        for (let y = 0; y < this._height; ++y) {
            for (let x = 0; x < this._width; ++x) {
                this._field[y][x].unhighlight()
            }
        }
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

                let tileComponent = tile.getComponent(Tile)
                this._field[y][x] = tileComponent
                tileComponent.x = x
                tileComponent.y = y

                tile.on(Node.EventType.MOUSE_ENTER, this.onHover, this, tileComponent)
                tile.on(Node.EventType.MOUSE_LEAVE, this.onHoverEnd, this, tileComponent)
            }
        }
    }

    start() {
        this.generateField()
    }

    update(deltaTime: number) {
        
    }
}


