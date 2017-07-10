class Manager {
	private game: com.Game
	private rect: com.Rect
	private particle: com.Particle
	private dropRect: com.DropRect
	private _moveInterval: number = 0
	// 滑块位移偏量
	private dir: number = 8
	public constructor(game: com.Game) {
		this.game = game
		this.rect = new com.Rect()
		this.particle = new com.Particle()
		this.dropRect = new com.DropRect()
		this.game.moveLayer.addChild(this.rect)
		mobx.autorun(() => {
			this.render()
		})
		mobx.autorun(() => {
			this.toggleGame()
		})
		this.initEvent()
	}
	// **************监听函数************
	private async render(): Promise<any> {
		this.rect && (this.rect.visible = false)
		await this.game.render()
		this.rect.y = this.getMoveRectY() - 69
		const width = this.getMoveRectSize()
		this.rect.setSize(width)
		this.rect.visible = true
		if (Math.random() >= 0.5) {
			this.rect.x = 750 - width
			this.dir = -8
		} else {
			this.rect.x = 0
			this.dir = 8
		}

	}

	private toggleGame(): void {
		const status = model.Data.ins.Status
		if (status === 'stop') {
			egret.clearInterval(this._moveInterval)
			this.rect.visible = false
			this.game.undoBtn.visible = false
			this.game.eventLayer.visible = false
			return
		}
		if (status === 'playing') {
			this.game.undoBtn.visible = true
			this.game.eventLayer.visible = true
			this._moveInterval = egret.setInterval(this.runGame, this, 16)
			return
		}
	}

	private runGame(): void {
		if (!this.rect) {
			return
		}
		this.rect.x += this.dir
		if (this.rect.x <= 0 || this.rect.x + this.rect.width >= 750) {
			this.dir = -1 * this.dir
		}
	}


	// **************监听函数************

	private initEvent(): void {
		this.game.undoBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onUndo, this)
		this.game.restartBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onRestart, this)
		this.game.keepBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, () => { }, this)
		this.game.eventLayer.addEventListener(egret.TouchEvent.TOUCH_TAP, this.play, this)
	}

	/**
     * 获取移动方块的y值
     */
	private getMoveRectY(): number {
		const n = model.Data.ins.List.length
		if (n) {
			if (n < com.Game.STLAYER) {
				return 895 - 69 * n
			}
			return 895 - 69 * com.Game.STLAYER
		}
		return 895
	}
    /**
     * 获取移动方块的尺寸
     */
	private getMoveRectSize(): number {
		const l = model.Data.ins.List.length
		return l ? model.Data.ins.List[l - 1].props.w : 364
	}

	// ************事件*************
	// 撤回
	private onUndo(): void {
		model.Data.ins.pop()
	}
	// 玩游戏
	private play(): void {
		if (!this.rect.visible) {
			return
		}
		const {x, w, status} = this.getNewLayerInfo()
		if (w <= 0) {
			// console.log('over')
			model.Data.ins.setStatus('stop')
			return
		}
		if (model.Data.ins.List.length % 2 === 0 || w < 66) {
			let isShowFlag = Math.random() > 0.6
			model.Data.ins.add({ props: { x, w, type: 'block', isShowFlag }, isb: true })
		} else {
			model.Data.ins.add({ props: { x, w, type: 'pillar' }, isp: true })
		}
		this.game.scroll.viewport['addChild'](this.dropRect)

		const particleInfo: any = this.getParticlePosAndSize()
		this.dropRect.show({ x, y: particleInfo.y, w, dir: 'left' })
		if (status > 1) {
			this.showParticle(particleInfo.x, particleInfo.y, { w: particleInfo.w, type: status === 3 ? 'perfect' : 'good' })
		}

	}
	private onRestart(): void {
		model.Data.ins.clear()
		model.Data.ins.setStatus('playing')
	}
	/********事件****************/

	private getNewLayerInfo(): any {
		const list = model.Data.ins.List
		const topItem: any = {}
		if (!list.length) {
			topItem.x = 0
			topItem.w = 364
		} else {
			const item: any = list[list.length - 1]
			topItem.x = item.props.x
			topItem.w = item.props.w
		}
		// console.log(topItem)
		let x = this.rect.x - (193 + topItem.x)
		let w = 0
		if (x >= 0) {
			w = topItem.w - x
			x = topItem.x + x
		} else {
			w = topItem.w + x
			x = topItem.x
		}
		w = w > 10 ? w : 0
		let status = 1
		if (w >= topItem.w * 0.95) {
			status = 3
		} else if (w >= topItem.w * 0.9) {
			status = 2
		}
		return {
			x, w, status
		}
	}
	private showParticle(x: number, y: number, props: any): void {
		this.game.scroll.viewport['addChild'](this.particle)
		this.particle.x = x
		this.particle.y = y
		this.particle.show(props)
	}

	private getParticlePosAndSize(): any {
		const list = model.Data.ins.List
		const n = list.length
		if (!n) {
			return {}
		} else {
			const item = list[n - 1]
			let y = n <= com.Game.STLAYER ? 895 - 69 * (n - 1) : 895 - 69 * (com.Game.STLAYER - 1)
			let w = item.props.w / 2
			let x = 193 + w + item.props.x
			return { x, y, w }
		}
	}
}