import { _decorator, Component, Label, Node } from 'cc';
import { PlayableArea } from './PlayableArea';
const { ccclass, property } = _decorator;

@ccclass('ScoreLabel')
export class ScoreLabel extends Component {

    @property (PlayableArea)
    public readonly playableArea: PlayableArea

    start() {
        let scoreCounter = this.playableArea.getScoreCounter()
        let label = this.node.getComponent(Label)
        let updateScore = () => {
            label.string = scoreCounter.CurrentScore.toString()
        }

        updateScore()
        scoreCounter.onScoreUpdated(updateScore)
    }

    update(deltaTime: number) {
        
    }
}


