import { _decorator, Component, EventMouse, instantiate, math, Node, Prefab, SpriteFrame, sys, tween, UITransform, Vec3, warn } from 'cc';
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
    private _tileMoveSpeed = 10

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

        tile.on(Node.EventType.MOUSE_ENTER, this.onHover, this, tileComponent)
        tile.on(Node.EventType.MOUSE_LEAVE, this.onHoverEnd, this, tileComponent)
        tile.on(Node.EventType.MOUSE_DOWN, this.onClick, this, tileComponent)

        return tile
    }

    private readonly _groupDirections = [
        [-1, 0],
        [0, -1],
        [1, 0],
        [0, 1],
    ]

    private getGroup(this: PlayableArea, x: number, y: number) {
        let result: [number, number][] = []

        if (!this._field[y][x]) {
            return result
        }

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

                if (this._field[newY] && this._field[newY][newX] && !this._field[newY][newX].isFalling &&
                    this._field[newY][newX].getColor() == desiredColor &&
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

    private moveTile(this: PlayableArea, tile: Tile, toX: number, toY: number) {
        let fromX = tile.x, fromY = tile.y

        if (fromY < toY) {
            return
        }

        let [toPosX, toPosY] = this.getPositionFromCoords(toX, toY)
        let fromPosX = tile.node.position.x, fromPosY = tile.node.position.y

        let distance = Math.sqrt((toPosX - fromPosX) ** 2 + (toPosY - fromPosY) ** 2)

        this._field[fromY][fromX] = null

        this._field[toY][toX] = tile
        tile.x = toX
        tile.y = toY
        tile.isFalling = true

        if (tile.tween) tile.tween.stop()

        let delay = Math.max(0, tile.spawnTime - Date.now() / 1000)

        tile.tween = tween(tile.node)
            .delay(delay)
            .to(distance / (this._tileMoveSpeed * this._nodeSize), { position: new Vec3(toPosX, toPosY) }, {
                onComplete: () => {
                    tile.isFalling = false
                }
            })
            .start()
    }

    private pourTile(this: PlayableArea, toX: number, toY: number, delay: number) {
        let tile = this.generateTile()

        let fromX = toX, fromY = this._height - 1
        let [toPosX, toPosY] = this.getPositionFromCoords(toX, toY)
        let [fromPosX, fromPosY] = this.getPositionFromCoords(fromX, fromY)

        let distance = Math.sqrt((toPosX - fromPosX) ** 2 + (toPosY - fromPosY) ** 2)

        tile.setPosition(fromPosX, fromPosY) 
        tile.parent = this.node
        tile.active = false

        let tileComponent = tile.getComponent(Tile)
        this._field[toY][toX] = tileComponent
        tileComponent.x = toX
        tileComponent.y = toY
        tileComponent.isFalling = true
        tileComponent.spawnTime = Date.now() / 1000 + delay

        tween(tile)
            .delay(delay)
            .set({ active: true })
            .call(() => {this.moveTile(tileComponent, toX, toY)})
            .start()
    }

    private onHover(this: PlayableArea, event: EventMouse) {

        let tile = event.target.getComponent(Tile)

        if (tile.isFalling) {
            return
        }

        let x = tile.x, y = tile.y

        let group = this.getGroup(x, y)
        if (group.length >= this._minGroupSize) {
            group.forEach(([x, y]) => {
                if (this._field[y][x]) {
                    this._field[y][x].highlight()
                }
            })
        }
    }

    private onHoverEnd(this: PlayableArea, event: EventMouse) {
        for (let y = 0; y < this._height; ++y) {
            for (let x = 0; x < this._width; ++x) {
                if (this._field[y][x]) {
                    this._field[y][x].unhighlight()
                }
            }
        }
    }

    private onClick(this: PlayableArea, event: EventMouse) {
        let tile = event.target.getComponent(Tile)
        
        if (tile.isFalling) {
            return
        }

        let x = tile.x, y = tile.y

        let group = this.getGroup(x, y)

        if (group.length >= this._minGroupSize) {
            group.forEach(([x, y]) => {
                if (this._field[y][x]) {
                    this._field[y][x].node.destroy()
                    this._field[y][x] = null
                }
            })

            for (let x = 0; x < this._width; ++x) {
                let toY = 0
                let timeUnit = 1 / this._tileMoveSpeed
                let delay = this._field[this._height - 1][x] ? timeUnit : 0

                for (let y = 0; y < this._height; ++y) {
                    if (this._field[y][x]) {
                        if (toY != y) {
                            delay = Math.max(delay, timeUnit + this._field[y][x].spawnTime - Date.now() / 1000)
                            this.moveTile(this._field[y][x], x, toY)
                        } 
                        toY += 1
                    }
                }

                for (let y = toY; y < this._height; ++y) {
                    this.pourTile(x, y, delay)
                    delay += timeUnit
                }
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
            }
        }
    }

    start() {
        this.generateField()
    }

    update(deltaTime: number) {
        
    }
}


