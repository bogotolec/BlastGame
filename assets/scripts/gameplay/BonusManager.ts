import { Button } from "cc";
import { Bonus } from "./Bonus";
import { Tile } from "./Tile";

export class BonusManager {
	private _bonuses: {[name: string]: Bonus} = {}
	private _rememberedTile: Tile | null

	public constructor(buttons: Button[], names: string[]) {
		for (let i = 0; i < buttons.length; ++i) {
			let bonus = new Bonus(buttons[i], 5, this)

			bonus.onActivate(this.onBonusActivated)
			bonus.onDeactivate(this.onBonusDeactivated)

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

	public rememberTile(tile: Tile) {
		if (this._rememberedTile) this._rememberedTile.unmark()
		this._rememberedTile = tile
		tile.mark()
	}

	public getRememberedTile() {
		return this._rememberedTile
	}

	private onBonusActivated(bonus: Bonus) {
		for (let bonusName in this._bonuses) {
			if (bonus != this._bonuses[bonusName]) {
				this._bonuses[bonusName].deactivateBonus()
			}
		}
	}

	private onBonusDeactivated(bonus: Bonus) {
		if (this._rememberedTile) this._rememberedTile.unmark()
		this._rememberedTile = null
	}
}