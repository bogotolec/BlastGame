export class ScoreCounter {
	private _currentScore = 0
	private _goal = 10000
    private _scoreUpdatedCallbacks = []
    private _winCallback: Function
    private _winCallbackContext: any

    public constructor(goal: number, winCallback: Function, callbackContext: any) {
    	this._goal = goal
    	this._winCallback = winCallback
    	this._winCallbackContext = callbackContext
    }

    public get CurrentScore() {
        return this._currentScore
    }

    private set CurrentScore(score: number) {
        this._currentScore = score
        this._scoreUpdatedCallbacks.forEach((callback: Function) => {
            callback()
        })
    }

    public getGoal() {
    	return this._goal
    }

    public addScore(score: number) {
    	this.CurrentScore += score
    	if (this.CurrentScore >= this._goal) this._winCallback.apply(this._winCallbackContext)
    }

    public resetScore() {
    	this._currentScore = 0 
    }

    public onScoreUpdated(callback: Function) {
        this._scoreUpdatedCallbacks.push(callback)
    }
}