import { Button, Color, Label } from "cc";
import { BonusManager } from "./BonusManager";

export class Bonus {

	private _button: Button
	private _amount: number = 0
    private _isActive = false
    private _originalColor: Color
    private _manager: BonusManager
    private _label: Label

    private _onActivateCallbacks = []

	public constructor(button: Button, amount: number, manager: BonusManager) {
        this._button = button
        this._amount = amount

        this._originalColor = button.normalColor.clone()

        this._manager = manager

        this._label = button.node.getChildByName("Count").getComponent(Label)
        this._label.string = this._amount.toString()

        button.node.on(Button.EventType.CLICK, this.onButtonPressed, this)
	}

    public activateBonus() {
        if (this._amount > 0) {
            this._button.normalColor = this._button.pressedColor
            this._isActive = true

            this._onActivateCallbacks.forEach((callback: (bonus: Bonus) => any) => {callback.apply(this._manager, [this])})
        }
    }

    public isActive() {
        return this._isActive
    }

    public deactivateBonus() {
        this._button.normalColor = this._originalColor
        this._isActive = false
    }

    public onActivate(callback: (bonus: Bonus) => any) {
        this._onActivateCallbacks.push(callback)
    }

    public use() {
        this._amount -= 1
        this.deactivateBonus()
        this._label.string = this._amount.toString()
    }

	private onButtonPressed(){
        if (this._isActive) {
            this.deactivateBonus()
        }
        else {
            this.activateBonus()
        }
	}

}