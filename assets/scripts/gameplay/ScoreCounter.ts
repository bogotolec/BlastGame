export class ScoreCounter {
	private _currentScore = 0
	private _goal = 10000
    private _scoreUpdatedCallbacks = []

    public constructor(goal: number) {
    	this._goal = goal
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
    }

    public resetScore() {
    	this._currentScore = 0 
    }

    public onScoreUpdated(callback: Function) {
        this._scoreUpdatedCallbacks.push(callback)
    }
}