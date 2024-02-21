import { _decorator, CCInteger, CCString, Component, Node, Slider, sys } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CustomSlider')
export class CustomSlider extends Component {
    
    @property ({type: CCInteger})
    public readonly minValue = 0

    @property ({type: CCInteger})
    public readonly maxValue = 10

    @property ({type: CCString})
    public readonly storageVariable : string

    private _slider  : Slider

    public getValue() {
        return Math.round(this._slider.progress * (this.maxValue - this.minValue) + this.minValue)
    }

    private valueToProgress(value: number) {
        return (value - this.minValue) / this.maxValue
    }

    private saveValueToStorage(this) {
        sys.localStorage.setItem(this.storageVariable, this.getValue())
    }

    start() {
        this._slider = this.node.getComponent(Slider)

        let storedValue = sys.localStorage.getItem(this.storageVariable)

        if (storedValue == null) 
            this._slider.progress = this.valueToProgress(storedValue)
        else 
            this.saveValueToStorage()

        this._slider.node.on('slide', this.saveValueToStorage, this)
    }

    update(deltaTime: number) {
        
    }
}


