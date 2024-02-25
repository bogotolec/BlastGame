export class TurnsCounter {
	private _turnsLeft = 0
	private _totalTurns = 50
    private _turnsUpdatedCallbacks = []

    public constructor(turns: number) {
    	this._totalTurns = turns
    	this._turnsLeft = turns
    }

    public get TurnsLeft() {
        return this._turnsLeft
    }

    private set TurnsLeft(turns: number) {
        this._turnsLeft = turns
        this._turnsUpdatedCallbacks.forEach((callback: Function) => {
            callback()
        })
    }

    public decrementTurns() {
    	this.TurnsLeft--
    }

    public resetTurns() {
    	this._turnsLeft = this._totalTurns 
    }

    public onTurnsUpdated(callback: Function) {
        this._turnsUpdatedCallbacks.push(callback)
    }
}