import { Component, Prefab, SpriteFrame, instantiate, Node } from "cc"
import { Queue } from "../utils/Queue"
import { Tile } from "./Tile"
import { GameField } from "./GameField"

export class TileGenerator {

	private _colorsAmount = 1

    private _tileGarbage = new Queue<Node>()
    private _tilePrefab: Prefab
    private _parent: Node
    private _originalComponent: Component
    private _tileSpriteFrames: SpriteFrame[]
    private _gameField: GameField

	public constructor(tileSpriteFrames: SpriteFrame[], tilePrefab: Prefab, originalComponent: Component, gameField: GameField) {
		this._colorsAmount = tileSpriteFrames.length
		this._tilePrefab = tilePrefab
		this._parent = originalComponent.node
        this._originalComponent = originalComponent
		this._tileSpriteFrames = tileSpriteFrames
		this._gameField = gameField
	}

	public getRandomColor() {
        return Math.floor(Math.random() * this._colorsAmount)
    }

	public generateTile(onHover: Function, onHoverEnd: Function, onClick: Function) : Node {
        let tile: Node
        let tileComponent: Tile

        if (this._tileGarbage.size() > 0) {
            tile = this._tileGarbage.dequeue()
            tileComponent = tile.getComponent(Tile)
        }
        else {
            tile = instantiate(this._tilePrefab)
            tile.parent = this._parent
            tile.active = false

            tileComponent = tile.getComponent(Tile)

	        tile.on(Node.EventType.MOUSE_ENTER, onHover, this._originalComponent, tileComponent)
	        tile.on(Node.EventType.MOUSE_LEAVE, onHoverEnd, this._originalComponent, tileComponent)
	        tile.on(Node.EventType.MOUSE_DOWN, onClick, this._originalComponent, tileComponent)
        }

        let color = this.getRandomColor()
        tileComponent.setColor(color, this._tileSpriteFrames[color])

        let tileSize = this._gameField.getNodeSize()

        tile.setScale(tileSize / 100, tileSize / 100)

        return tile
    }

    public deleteTile(tile: Tile) {
        let tileNode = tile.node
        let x = tile.x, y = tile.y

        tile.unhighlight()
        tileNode.active = false
        this._tileGarbage.enqueue(tileNode)

        this._gameField.removeTile(x, y)
    }
}