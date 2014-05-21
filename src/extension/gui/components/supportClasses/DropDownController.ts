/**
 * Copyright (c) Egret-Labs.org. Permission is hereby granted, free of charge,
 * to any person obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom
 * the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
 * FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/// <reference path="../../../../egret/display/DisplayObject.ts"/>
/// <reference path="../../../../egret/display/DisplayObjectContainer.ts"/>
/// <reference path="../../../../egret/events/Event.ts"/>
/// <reference path="../../../../egret/events/EventDispatcher.ts"/>
/// <reference path="../../../../egret/events/TimerEvent.ts"/>
/// <reference path="../../../../egret/events/TouchEvent.ts"/>
/// <reference path="../../../../egret/utils/Timer.ts"/>
/// <reference path="ButtonBase.ts"/>
/// <reference path="../../core/UIGlobals.ts"/>
/// <reference path="../../events/UIEvent.ts"/>

module ns_egret {

	/**
	 * @class ns_egret.DropDownController
	 * @classdesc
	 * 用于处理因用户交互而打开和关闭下拉列表的操作的控制器
	 * @extends ns_egret.EventDispatcher
	 */	
	export class DropDownController extends EventDispatcher{
		/**
		 * 构造函数
		 * @method ns_egret.DropDownController#constructor
		 */		
		public constructor(){
			super();
		}
		/**
		 * 鼠标按下标志
		 */		
		private mouseIsDown:boolean;
			
		private _openButton:ButtonBase;
		/**
		 * 下拉按钮实例
		 * @member ns_egret.DropDownController#openButton
		 */	
		public get openButton():ButtonBase{
			return this._openButton;
		}
		public set openButton(value:ButtonBase){
			if (this._openButton === value)
				return;
			this.removeOpenTriggers();
			this._openButton = value;
			this.addOpenTriggers();
			
		}
		/**
		 * 要考虑作为下拉列表的点击区域的一部分的显示对象列表。
		 * 在包含项列出的任何组件内进行鼠标单击不会自动关闭下拉列表。
		 * @member ns_egret.DropDownController#hitAreaAdditions
		 */		
		public hitAreaAdditions:Array<DisplayObject>;
		
		private _dropDown:DisplayObject;
		/**
		 * 下拉区域显示对象
		 * @member ns_egret.DropDownController#dropDown
		 */		
		public get dropDown():DisplayObject{
			return this._dropDown;
		}
		public set dropDown(value:DisplayObject){
			if (this._dropDown === value)
				return;
			
			this._dropDown = value;
		}   
		
		
		private _isOpen:boolean = false;
		/**
		 * 下拉列表已经打开的标志
		 * @member ns_egret.DropDownController#isOpen
		 */		
		public get isOpen():boolean{
			return this._isOpen;
		}
		
		private _closeOnResize:boolean = true;
		/**
		 * 如果为 true，则在调整舞台大小时会关闭下拉列表。
		 * @member ns_egret.DropDownController#closeOnResize
		 */		
		public get closeOnResize():boolean{
			return this._closeOnResize;
		}
		
		public set closeOnResize(value:boolean){
			if (this._closeOnResize == value)
				return;
			if (this.isOpen)
				this.removeCloseOnResizeTrigger();
			
			this._closeOnResize = value;
			
			this.addCloseOnResizeTrigger();
		}
		
		private _rollOverOpenDelay:number = NaN;
		
		private rollOverOpenDelayTimer:Timer;
		/**
		 * 指定滑过锚点按钮时打开下拉列表要等待的延迟（以毫秒为单位）。
		 * 如果设置为 NaN，则下拉列表会在单击时打开，而不是在滑过时打开。默认值NaN
		 * @member ns_egret.DropDownController#rollOverOpenDelay
		 */		
		public get rollOverOpenDelay():number{
			return this._rollOverOpenDelay;
		}
		
		public set rollOverOpenDelay(value:number){
			if (this._rollOverOpenDelay == value)
				return;
			
			this.removeOpenTriggers();
			
			this._rollOverOpenDelay = value;
			
			this.addOpenTriggers();
		}
		/**
		 * 添加触发下拉列表打开的事件监听
		 */		
		private addOpenTriggers():void{
			if (this.openButton){
				if (isNaN(this.rollOverOpenDelay))
					this.openButton.addEventListener(UIEvent.BUTTON_DOWN, this._openButton_buttonDownHandler, this);
				else
					this.openButton.addEventListener(TouchEvent.TOUCH_ROLL_OVER, this._openButton_rollOverHandler, this);
			}
		}
		/**
		 * 移除触发下拉列表打开的事件监听
		 */	
		private removeOpenTriggers():void{
			if (this.openButton){
				if (isNaN(this.rollOverOpenDelay))
					this.openButton.removeEventListener(UIEvent.BUTTON_DOWN, this._openButton_buttonDownHandler, this);
				else
					this.openButton.removeEventListener(TouchEvent.TOUCH_ROLL_OVER, this._openButton_rollOverHandler, this);
			}
		}
		/**
		 * 添加触发下拉列表关闭的事件监听
		 */	
		private addCloseTriggers():void{
			if (UIGlobals.stage){
				if (isNaN(this.rollOverOpenDelay)){
					UIGlobals.stage.addEventListener(TouchEvent.TOUCH_BEGAN, this.stage_mouseDownHandler, this);
					UIGlobals.stage.addEventListener(TouchEvent.TOUCH_END, this.stage_mouseUpHandler_noRollOverOpenDelay, this);
				}
				else{
					UIGlobals.stage.addEventListener(TouchEvent.TOUCH_MOVE, this.stage_mouseMoveHandler, this);
				}
				
				this.addCloseOnResizeTrigger();
			}
		}
		
		/**
		 * 移除触发下拉列表关闭的事件监听
		 */	
		private removeCloseTriggers():void{
			if (UIGlobals.stage){
				if (isNaN(this.rollOverOpenDelay)){
					UIGlobals.stage.removeEventListener(TouchEvent.TOUCH_BEGAN, this.stage_mouseDownHandler, this);
					UIGlobals.stage.removeEventListener(TouchEvent.TOUCH_END, this.stage_mouseUpHandler_noRollOverOpenDelay, this);
				}
				else{
					UIGlobals.stage.removeEventListener(TouchEvent.TOUCH_MOVE, this.stage_mouseMoveHandler, this);
					UIGlobals.stage.removeEventListener(TouchEvent.TOUCH_END, this.stage_mouseUpHandler, this);
					UIGlobals.stage.removeEventListener(Event.LEAVE_STAGE, this.stage_mouseUpHandler, this);
				}
				
				this.removeCloseOnResizeTrigger();
				
			}
		} 
		/**
		 * 添加舞台尺寸改变的事件监听
		 */	
		private addCloseOnResizeTrigger():void{
			if (this.closeOnResize)
				UIGlobals.stage.addEventListener(Event.RESIZE, this.stage_resizeHandler, this);
		}
		/**
		 * 移除舞台尺寸改变的事件监听
		 */
		private removeCloseOnResizeTrigger():void{
			if (this.closeOnResize)
				UIGlobals.stage.removeEventListener(Event.RESIZE, this.stage_resizeHandler, this);
		}
		/**
		 * 检查鼠标是否在DropDown或者openButton区域内。
		 */		
		private isTargetOverDropDownOrOpenButton(target:DisplayObject):boolean{
			if (target){
				
				if (this.openButton && this.openButton.contains(target))
					return true;
				if (this.hitAreaAdditions != null){
					for (var i:number = 0;i<this.hitAreaAdditions.length;i++){
						if (this.hitAreaAdditions[i] == target ||
							((this.hitAreaAdditions[i] instanceof DisplayObjectContainer) && (<DisplayObjectContainer><any> (this.hitAreaAdditions[i])).contains(<DisplayObject><any> target)))
							return true;
					}
				}
				if (this.dropDown instanceof DisplayObjectContainer){
					if ((<DisplayObjectContainer><any> (this.dropDown)).contains(target))
						return true;
				}
				else{
					if (target == this.dropDown)
						return true;
				}
			}
			
			return false;
		}
		/**
		 * 打开下拉列表
		 * @method ns_egret.DropDownController#openDropDown
		 */		
		public openDropDown():void{
			this.openDropDownHelper();
		}  
		/**
		 * 执行打开下拉列表
		 */		
		private openDropDownHelper():void{
			if (!this.isOpen){
				this.addCloseTriggers();
				
				this._isOpen = true;
				
				if (this.openButton)
					this.openButton._setKeepDown(true);
				UIEvent.dispatchUIEvent(this,UIEvent.OPEN);
			}
		}
		/**
		 * 关闭下拉列表
		 * @method ns_egret.DropDownController#closeDropDown
		 * @param commit {boolean} 
		 */	
		public closeDropDown(commit:boolean):void{
			if (this.isOpen){   
				this._isOpen = false;
				if (this.openButton)
					this.openButton._setKeepDown(false);
				
				var dde:UIEvent = new UIEvent(UIEvent.CLOSE, false, true);
				
				if (!commit)
					dde.preventDefault();
				
				this.dispatchEvent(dde);
				
				this.removeCloseTriggers();
			}
		}   
		/**
		 * openButton上按下鼠标事件
		 * @method ns_egret.DropDownController#_openButton_buttonDownHandler
		 * @param event {Event} 
		 */		
		public _openButton_buttonDownHandler(event:Event):void{
			if (this.isOpen)
				this.closeDropDown(true);
			else{
				this.mouseIsDown = true;
				this.openDropDownHelper();
			}
		}
		/**
		 * openButton上鼠标经过事件
		 * @method ns_egret.DropDownController#_openButton_rollOverHandler
		 * @param event {TouchEvent} 
		 */		
		public _openButton_rollOverHandler(event:TouchEvent):void{
			if (this.rollOverOpenDelay == 0)
				this.openDropDownHelper();
			else{
				this.openButton.addEventListener(TouchEvent.TOUCH_ROLL_OUT, this.openButton_rollOutHandler, this);
				this.rollOverOpenDelayTimer = new Timer(this.rollOverOpenDelay, 1);
				this.rollOverOpenDelayTimer.addEventListener(TimerEvent.TIMER_COMPLETE, this.rollOverDelay_timerCompleteHandler, this);
				this.rollOverOpenDelayTimer.start();
			}
		}
		/**
		 * openButton上鼠标移出事件
		 */	
		private openButton_rollOutHandler(event:TouchEvent):void{
			if (this.rollOverOpenDelayTimer && this.rollOverOpenDelayTimer.running){
				this.rollOverOpenDelayTimer.stop();
				this.rollOverOpenDelayTimer = null;
			}
			
			this.openButton.removeEventListener(TouchEvent.TOUCH_ROLL_OUT, this.openButton_rollOutHandler, this);
		}
		/**
		 * 到达鼠标移入等待延迟打开的时间。
		 */		
		private rollOverDelay_timerCompleteHandler(event:TimerEvent):void{
			this.openButton.removeEventListener(TouchEvent.TOUCH_ROLL_OUT, this.openButton_rollOutHandler, this);
			this.rollOverOpenDelayTimer = null;
			
			this.openDropDownHelper();
		}
		/**
		 * 舞台上鼠标按下事件
		 * @method ns_egret.DropDownController#stage_mouseDownHandler
		 * @param event {Event} 
		 */		
		public stage_mouseDownHandler(event:Event):void{
			
			if (this.mouseIsDown){
				this.mouseIsDown = false;
				return;
			}
			
			if (!this.dropDown || 
				(this.dropDown && 
					(event.target == this.dropDown 
						|| (this.dropDown instanceof DisplayObjectContainer && 
							!(<DisplayObjectContainer><any> (this.dropDown)).contains(<DisplayObject><any> (event.target)))))){
				
				var target:DisplayObject = <DisplayObject><any> (event.target);
				if (this.openButton && target && this.openButton.contains(target))
					return;
				
				if (this.hitAreaAdditions != null){
					for (var i:number = 0;i<this.hitAreaAdditions.length;i++){
						if (this.hitAreaAdditions[i] == event.target ||
							((this.hitAreaAdditions[i] instanceof DisplayObjectContainer) && (<DisplayObjectContainer><any> (this.hitAreaAdditions[i])).contains(<DisplayObject><any> (event.target))))
							return;
					}
				}
				
				this.closeDropDown(true);
			} 
		}
		/**
		 * 舞台上鼠标移动事件
		 * @method ns_egret.DropDownController#stage_mouseMoveHandler
		 * @param event {Event} 
		 */		
		public stage_mouseMoveHandler(event:Event):void{
			var target:DisplayObject = <DisplayObject><any> (event.target);
			var containedTarget:boolean = this.isTargetOverDropDownOrOpenButton(target);
			
			if (containedTarget)
				return;
			if (event instanceof TouchEvent && (<TouchEvent><any> event).touchDown){
				UIGlobals.stage.addEventListener(TouchEvent.TOUCH_END,this.stage_mouseUpHandler,this);
				UIGlobals.stage.addEventListener(Event.LEAVE_STAGE,this.stage_mouseUpHandler,this);
				return;
			}
			this.closeDropDown(true);
		}
		/**
		 * 舞台上鼠标弹起事件
		 * @method ns_egret.DropDownController#stage_mouseUpHandler_noRollOverOpenDelay
		 * @param event {Event} 
		 */		
		public stage_mouseUpHandler_noRollOverOpenDelay(event:Event):void{
			
			if (this.mouseIsDown){
				this.mouseIsDown = false;
				return;
			}
		}
		/**
		 * 舞台上鼠标弹起事件
		 * @method ns_egret.DropDownController#stage_mouseUpHandler
		 * @param event {Event} 
		 */	
		public stage_mouseUpHandler(event:Event):void{
			var target:DisplayObject = <DisplayObject><any> (event.target);
			var containedTarget:boolean = this.isTargetOverDropDownOrOpenButton(target);
			if (containedTarget){
				UIGlobals.stage.removeEventListener(TouchEvent.TOUCH_END, this.stage_mouseUpHandler, this);
				UIGlobals.stage.removeEventListener(Event.LEAVE_STAGE, this.stage_mouseUpHandler, this);
				return;
			}
			
			this.closeDropDown(true);
		}
		/**
		 * 舞台尺寸改变事件
		 * @method ns_egret.DropDownController#stage_resizeHandler
		 * @param event {Event} 
		 */		
		public stage_resizeHandler(event:Event):void{
			this.closeDropDown(true);
		}    
		/**
		 * 舞台上鼠标滚轮事件
		 */		
		private stage_mouseWheelHandler(event:TouchEvent):void{
			
			if (this.dropDown && !((<DisplayObjectContainer><any> (this.dropDown)).contains(<DisplayObject><any> (event.target)) && event.isDefaultPrevented()))
				this.closeDropDown(false);
		}
	}
}