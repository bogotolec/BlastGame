import { _decorator, Color, Component, EventMouse, Prefab, SpriteFrame, sys, } from 'cc';
import { Tile } from './Tile';
import { GameField } from './GameField';
import { TileGenerator } from './TileGenerator';
import { ScoreCounter } from './ScoreCounter';
import { TurnsCounter } from './TurnsCounter';
import { Popup } from './Popup';
const { ccclass, property } = _decorator;

@ccclass('PlayableArea')
export class PlayableArea extends Component {

    @property (Prefab)
    public readonly tilePrefab: Prefab

    @property (SpriteFrame)
    public tileSpriteFrames: SpriteFrame[] = []

    @property (Popup)
    public popupWindow: Popup

    private _gameField: GameField
    private _tileGenerator: TileGenerator

    private _height = 5
    private _width = 5
    private _colors = 2
    private _minGroupSize = 2

    private _tileMoveSpeed = 10

    private _scoreCounter = new ScoreCounter(10000, this.win, this)
    private _turnsCounter = new TurnsCounter(50, this.lose, this)

    private _gameInProgress = false

    public getScoreCounter() {
        return this._scoreCounter
    }

     public getTurnsCounter() {
        return this._turnsCounter
    }

    private updateGameSettings() {
        this._height = sys.localStorage.getItem("FieldHeight") || this._height
        this._width = sys.localStorage.getItem("FieldWidth") || this._width
        this._colors = sys.localStorage.getItem("ColorsAmount") || this._colors
        this._minGroupSize = sys.localStorage.getItem("MinGroupSize") || this._minGroupSize
    }

    private calculateScore(groupSize: number): number {
        return groupSize * 10
    }

    private unhighlight(this: PlayableArea) {
        this._gameField.forEachTile((tile: Tile) => {tile.unhighlight()})
    }

    private highlightGroupbyTile(this: PlayableArea, tile: Tile) {
        if (!tile || tile.isFalling) {
            return
        }

        let x = tile.x, y = tile.y

        let group = this._gameField.getGroup(x, y)
        if (group.length >= this._minGroupSize) {
            group.forEach((tile: Tile) => {
                tile.highlight()
            })
        }
    }

    private _currentSelectedTile = null

    private onHover(this: PlayableArea, event: EventMouse) {
        if (!this._gameInProgress) return

        let tile = event.target.getComponent(Tile)
        this._currentSelectedTile = tile
        this.highlightGroupbyTile(tile)
    }

    private onHoverEnd(this: PlayableArea, event: EventMouse) {
        this._currentSelectedTile = null
        this.unhighlight()
    }

    private onClick(this: PlayableArea, event: EventMouse) {
        if (!this._gameInProgress) return

        let tile = event.target.getComponent(Tile)
        
        if (tile.isFalling) {
            return
        }

        let x = tile.x, y = tile.y

        let group = this._gameField.getGroup(x, y)

        if (group.length >= this._minGroupSize) {

            this._currentSelectedTile = null

            this._scoreCounter.addScore(this.calculateScore(group.length))
            this._turnsCounter.decrementTurns()

            group.forEach((tile: Tile) => {
                this._tileGenerator.deleteTile(tile)
            })

            let tileFallEndTimings = new Set()

            for (let x = 0; x < this._width; ++x) {
                let toY = 0
                let timeUnit = 1 / this._tileMoveSpeed
                let delay = this._gameField.tileExists(x, this._height - 1) ? timeUnit : 0

                for (let y = 0; y < this._height; ++y) {
                    if (this._gameField.tileExists(x, y)) {
                        let tile = this._gameField.getTileAtPosition(x, y)

                        if (toY != y) {
                            delay = Math.max(delay, timeUnit + tile.spawnTime - Date.now() / 1000)
                            let tileFallAt = this._gameField.moveTile(tile, x, toY)
                            tileFallAt = Math.ceil(tileFallAt * 10) / 10
                            tileFallEndTimings.add(tileFallAt)
                        } 
                        toY += 1
                    }
                }

                for (let y = toY; y < this._height; ++y) {
                    let tile = this._tileGenerator.generateTile(this.onHover, this.onHoverEnd, this.onClick)
                    let tileFallAt = this._gameField.pourTile(tile.getComponent(Tile), x, y, delay)
                    tileFallAt = Math.ceil(tileFallAt * 10) / 10
                    tileFallEndTimings.add(tileFallAt)
                    delay += timeUnit
                }
            }

            tileFallEndTimings.forEach((t: number) => {
                this.scheduleOnce(() => {
                    this.highlightGroupbyTile(this._currentSelectedTile)
                }, t + 0.05)
            })

            if (!this._gameField.isGroupOfSizeExists(this._minGroupSize)) {
                this.lose()
            }
        }
    }

    private lose(this: PlayableArea) {
        this._gameInProgress = false

        this.popupWindow.setText("You lose :(")
        this.popupWindow.setTextColor(new Color(255, 0, 0))
        this.popupWindow.activate()
    }

    private win(this: PlayableArea) {
        this._gameInProgress = false

        this.popupWindow.setText("You win :)")
        this.popupWindow.setTextColor(new Color(0, 255, 0))
        this.popupWindow.activate()
    }

    start() {
        this.updateGameSettings()
        
        this._gameField = new GameField(this._height, this._width, this._tileMoveSpeed, this)
        this._tileGenerator = new TileGenerator(this.tileSpriteFrames.slice(0, this._colors), this.tilePrefab, this, this._gameField)

        let callbacks: [Function, Function, Function] = [this.onHover, this.onHoverEnd, this.onClick]

        this._gameField.generateField(this._tileGenerator, callbacks)
        this._gameInProgress = true
    }

    update(deltaTime: number) {
        
    }
}


