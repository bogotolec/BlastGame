import { _decorator, Component, Label, Node, Slider } from 'cc';
import { CustomSlider } from './CustomSlider';
const { ccclass, property } = _decorator;

@ccclass('SliderCounter')
export class SliderCounter extends Component {

    @property ({type: CustomSlider})
    public customSlider : CustomSlider

    start() {
        let label = this.node.getComponent(Label)
        let slider = this.customSlider.node.getComponent(Slider)

        let onSlide = () => {
            label.string = this.customSlider.getValue().toString()
        }

        label.string = this.customSlider.getValue().toString()

        slider.node.on('slide', onSlide)
    }

    update(deltaTime: number) {
        
    }
}


