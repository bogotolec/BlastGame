export class ScoreCounter {
	private _currentScore = 0
    private _scoreUpdatedCallbacks = []

    public get CurrentScore() {
        return this._currentScore
    }

    private set CurrentScore(score: number) {
        this._currentScore = score
        this._scoreUpdatedCallbacks.forEach((callback: Function) => {
            callback()
        })
    }

    public addScore(score: number) {
    	this.CurrentScore += score
    }

    public resetScore() {
    	this._currentScore = 0 
    }

    public onScoreUpdated(callback: Function) {
        this._scoreUpdatedCallbacks.push(callback)
    }
}