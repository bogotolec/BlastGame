export class TurnsCounter {
	private _turnsLeft = 0
	private _totalTurns = 50
    private _turnsUpdatedCallbacks = []
    private _loseCallback: Function
    private _loseCallbackContext: any

    public constructor(turns: number, loseCallback: Function, callbackContext: any) {
    	this._totalTurns = turns
    	this._turnsLeft = turns
    	this._loseCallback = loseCallback
        this._loseCallbackContext = callbackContext
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
        if (--this.TurnsLeft <= 0) this._loseCallback.apply(this._loseCallbackContext)
    }

    public resetTurns() {
    	this._turnsLeft = this._totalTurns 
    }

    public onTurnsUpdated(callback: Function) {
        this._turnsUpdatedCallbacks.push(callback)
    }
}