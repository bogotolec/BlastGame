import { _decorator, Component, Label, Node } from 'cc';
import { PlayableArea } from './PlayableArea';
const { ccclass, property } = _decorator;

@ccclass('TurnsLabel')
export class TurnsLabel extends Component {

    @property (PlayableArea)
    public readonly playableArea: PlayableArea

    start() {
        let turnsCounter = this.playableArea.getTurnsCounter()
        let label = this.node.getComponent(Label)
        let updateScore = () => {
            label.string = turnsCounter.TurnsLeft.toString()
        }

        updateScore()
        turnsCounter.onTurnsUpdated(updateScore)
    }

    update(deltaTime: number) {
        
    }
}


