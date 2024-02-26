import { Component, UITransform, Vec3, tween } from "cc";
import { Tile } from "./Tile";
import { Queue } from "../utils/Queue";
import { TileGenerator } from "./TileGenerator";

export class GameField {

	private _originalComponent : Component

	private _height = 1
	private _width = 1
	private _nodeSize = 1
	private _y0 = 0
    private _tileMoveSpeed = 10

    private _field: Tile[][] = []

    public constructor(height: number, width: number, tileMoveSpeed: number, originalComponent: Component) {
    	this._height = height
    	this._width = width

    	this._originalComponent = originalComponent

        let contentSize = originalComponent.getComponent(UITransform).contentSize
    	this._nodeSize = Math.min(contentSize.x / this._width, contentSize.y / this._height)
        this._y0 = -contentSize.y / 2
        this._tileMoveSpeed = tileMoveSpeed
    }

    public tileExists(x: number, y: number) {
        return this._field[y] && this._field[y][x] ? true : false
    }

    public getTileAtPosition(x: number, y: number) {
        return this._field[y] && this._field[y][x]
    }

    public getNodeSize() {
    	return this._nodeSize
    }

    public removeTile(x: number, y: number) {
    	this._field[y][x] = null
    }

    public getPositionFromCoords(x: number, y: number) {
        return [
            (x - this._width / 2  + 0.5) * this._nodeSize,
            this._y0 + (y + 0.5) * (this._nodeSize),
        ]
    }

    private readonly _groupDirections = [
        [-1, 0],
        [0, -1],
        [1, 0],
        [0, 1],
    ]

    public getGroup(x: number, y: number, countFalling: boolean = false) {
        let result: Tile[] = []

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
            result.push(this._field[curY][curX])

            this._groupDirections.forEach(([diffX, diffY]) => {
                let newX = curX + diffX, newY = curY + diffY

                if (this._field[newY] && this._field[newY][newX] && (countFalling || !this._field[newY][newX].isFalling) &&
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

    public isGroupOfSizeExists(size: number) : boolean {
        // check in staggered manner
        // to speed up it twice
        for (let y = 0; y < this._height; y++) {
            for (let x = (y + 1) % 2; x < this._width; x += 2) {
                let group = this.getGroup(x, y, true)

                if (group.length >= size) return true 
            }
        }

        return false
    }

    public forEachTile(callback: (tile: Tile) => any) {
        for (let y = 0; y < this._height; ++y) {
            for (let x = 0; x < this._width; ++x) {
                if (this._field[y][x]) {
                    callback(this._field[y][x])
                }
            }
        }
    }

    private calculateMoveTime(fromPosX: number, fromPosY: number, toPosX: number, toPosY: number) {
        let distance = Math.sqrt((toPosX - fromPosX) ** 2 + (toPosY - fromPosY) ** 2)
        return distance / (this._tileMoveSpeed * this._nodeSize)
    }

    public moveTile(tile: Tile, toX: number, toY: number) {
        let fromX = tile.x, fromY = tile.y

        if (fromY < toY) {
            return
        }

        let [toPosX, toPosY] = this.getPositionFromCoords(toX, toY)
        let fromPosX = tile.node.position.x, fromPosY = tile.node.position.y
        
        let uiTransform = tile.getComponent(UITransform);
        uiTransform.priority = toY

        this._field[fromY][fromX] = null

        this._field[toY][toX] = tile
        tile.x = toX
        tile.y = toY
        tile.isFalling = true


        let delay = Math.max(0, tile.spawnTime - Date.now() / 1000)

        let tweenTime = this.calculateMoveTime(fromPosX, fromPosY, toPosX, toPosY)

        this._originalComponent.scheduleOnce(() => {
            if (tile.tween) tile.tween.stop()

            tile.tween = tween(tile.node)
                .to(tweenTime, 
                    { position: new Vec3(toPosX, toPosY) }, 
                    { onComplete: () => { tile.isFalling = false }
                })
                .start()
        }, delay) 

        return delay + tweenTime
    }

    public setTilePosition(tile: Tile, x: number, y: number) {
        let fromX = tile.x, fromY = tile.y

        tile.x = x
        tile.y = y

        let [toPosX, toPosY] = this.getPositionFromCoords(x, y)
        this._field[y][x] = tile
        if (this._field[fromY][fromX] == tile) this._field[fromY][fromX] = null

        let uiTransform = tile.getComponent(UITransform);
        uiTransform.priority = y

        tile.node.setPosition(toPosX, toPosY) 
    }

    public pourTile(tile : Tile, toX: number, toY: number, delay: number) {

        let fromX = toX, fromY = this._height - 1
        let [toPosX, toPosY] = this.getPositionFromCoords(toX, toY)
        let [fromPosX, fromPosY] = this.getPositionFromCoords(fromX, fromY)

        tile.node.setPosition(fromPosX, fromPosY) 
        let uiTransform = tile.getComponent(UITransform);
        uiTransform.priority = toY

        this._field[toY][toX] = tile
        tile.x = toX
        tile.y = toY
        tile.isFalling = true
        tile.spawnTime = Date.now() / 1000 + delay

        let moveEndAfter = delay + this.calculateMoveTime(fromPosX, fromPosY, toPosX, toPosY)

        this._originalComponent.scheduleOnce(() => {
            tile.node.active = true
            this.moveTile(tile, toX, toY)
        }, delay)

        return moveEndAfter
    }

    public generateField(tileGenerator: TileGenerator, callbacks: [Function, Function, Function]) {
        for (let y = 0; y < this._height; y++) {
            this._field[y] = []
            for (let x = 0; x < this._width; x++) {
                let tileNode = tileGenerator.generateTile(...callbacks)
                let tileComponent = tileNode.getComponent(Tile)

                let [posX, posY] = this.getPositionFromCoords(x, y)

                tileNode.setPosition(posX, posY)

                let uiTransform = tileNode.getComponent(UITransform);
                uiTransform.priority = y

                tileNode.active = true

                this._field[y][x] = tileComponent
                tileComponent.x = x
                tileComponent.y = y
            }
        }
    }
}