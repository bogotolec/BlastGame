import { _decorator, Component, math, Node, ProgressBar, tween } from 'cc';
import { PlayableArea } from './PlayableArea';
const { ccclass, property } = _decorator;

@ccclass('ScoreProgressBar')
export class ScoreProgressBar extends Component {

    @property (PlayableArea)
    public readonly playableArea: PlayableArea

    private calculateProgress(score: number, goal: number) {
        let min = 0.05
        return score == 0 ? 0 : Math.min(1, Math.max(min, (score / goal) * (1 - min) + min))
    }

    start() {
        let scoreCounter = this.playableArea.getScoreCounter()
        let progressBar = this.node.getComponent(ProgressBar)
        let updateScore = () => {

            if (progressBar.progress == 0) {
                progressBar.progress = this.calculateProgress(scoreCounter.CurrentScore, scoreCounter.getGoal())
            }
            else {
                tween(progressBar)
                    .to(0.2, {progress: this.calculateProgress(scoreCounter.CurrentScore, scoreCounter.getGoal())})
                    .start()
            }

            
        }

        updateScore()
        scoreCounter.onScoreUpdated(updateScore)
    }

    update(deltaTime: number) {
        
    }
}


