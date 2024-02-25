import { Button } from "cc";
import { Bonus } from "./Bonus";

export class BonusManager {
	private _bonuses: {[name: string]: Bonus} = {}

	public constructor(buttons: Button[], names: string[]) {
		for (let i = 0; i < buttons.length; ++i) {
			let bonus = new Bonus(buttons[i], 5, this)

			bonus.onActivate(this.onBonusActivated)

			this._bonuses[names[i]] = bonus
		}
	}

	public getActiveBonus() : (string | null) {
		for (let bonusName in this._bonuses) {
			if (this._bonuses[bonusName].isActive()) {
				return bonusName
			}
		}

		return null
	}

	public useBonus(bonusName: string) {
		if (this._bonuses[bonusName]) this._bonuses[bonusName].use()
	}

	private onBonusActivated(bonus: Bonus) {
		for (let bonusName in this._bonuses) {
			if (bonus != this._bonuses[bonusName]) {
				this._bonuses[bonusName].activateBonus()
			}
		}
	}
}