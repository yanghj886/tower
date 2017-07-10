module com {
	export class DropRect extends eui.Rect {
		private static offset: number = 0.8
		public constructor() {
			super()
			this.includeInLayout = false
			this.fillColor = 0xf9d18c
			this.height = 69
			this.anchorOffsetY = 69 * DropRect.offset
		}
		public show(props: any): void {
			this.alpha = 1
			this.rotation = 0
			const {x, y, w, dir} = props
			this.width = w
			this.y = y - 69 * (1 - DropRect.offset)
			const offestX = this.width * (1 - DropRect.offset)
			this.x = dir === 'left' ? x - offestX : x + offestX
			egret.Tween.get(this).wait(200).to({
				rotation: 120,
				y: y - 100,
				alpha: 0
			}, 1000).call(() => {
				this.parent && this.parent.removeChild(this)
			})

		}
	}
}