
//% color="#FF6632" icon="\uf0fb" block="Shake Sensor" blockId="shake_sensor"
namespace ExpSense {
    input.setAccelerometerRange(AcceleratorRange.TwoG)
    let accxn = 0
    let accyn = 0
    let accsn = 1048
    let deltaxy = 50
    let deltas = 30
    let deltamodifier = 1.2 //1 = 100% 2 = 200% ...
    let booom = true
    let stop = true
    let onExplosiveStateHandler: (xaxis: number, yaxis: number, shakingvalue: number) => void;
    let onExplodeHandler: () => void;

    let clear = (): void => {
        for (let y = 0; y < 5; y++) {
            for (let x = 0; x < 5; x++) {
                led.unplot(x, y)
            }
        }
    }

    basic.forever(function () {
        if (!stop) {
            let accx = input.acceleration(Dimension.X)
            let accy = input.acceleration(Dimension.Y)
            let accz = input.acceleration(Dimension.Z)
            let accs = input.acceleration(Dimension.Strength)
            let xaxis = Math.idiv(accx - accxn, deltaxy * deltamodifier)
            let yaxis = Math.idiv(accy - accyn, deltaxy * deltamodifier)
            let xyzacc = Math.idiv(Math.abs(accs - accsn), deltas * deltamodifier)

            if (accz > -512) booom = true //face down orientation
            if (xyzacc > 9) booom = true //shake it, baby
            if (Math.abs(xaxis) > 2 || Math.abs(yaxis) > 2) booom = true //on an inclined surface

            control.inBackground(function () {
                if (onExplosiveStateHandler) {
                    onExplosiveStateHandler(xaxis, yaxis, xyzacc);
                }
            })
            if (booom && !stop) {
                stop = true
                if (onExplodeHandler) {
                    onExplodeHandler();
                }
            }
        }
        basic.pause(100)
    })

    /**
     * Registers code to run when the acceleration data changed.
    */
    //% blockId=ExpSense_state block="on explosive state changed"
    //% draggableParameters=reporter
    export function onExplosiveState(cb: (xaxis: number, yaxis: number, shakingvalue: number) => void) {
        onExplosiveStateHandler = cb;
    }

    /**
    * Registers the code that runs when mc:b has exploded.
    */
    //% blockId=ExpSense_explode block="on explode"
    //% draggableParameters=reporter
    export function onExplode(cb: () => void) {
        onExplodeHandler = cb;
    }

    /**
    * Start / restart shake monitoring.
    */
    //% blockId=ExpSense_restart block="restart shake monitoring"
    export function restart(): void {
        stop = true
        basic.showNumber(3, 100)
        basic.showNumber(2, 100)
        basic.showNumber(1, 100)
        let accx = input.acceleration(Dimension.X)
        let accy = input.acceleration(Dimension.Y)
        let accs = input.acceleration(Dimension.Strength)
        for (let i = 0; i < 5; i++) {
            basic.pause(50)
            accx += input.acceleration(Dimension.X)
            accy += input.acceleration(Dimension.Y)
            accs += input.acceleration(Dimension.Strength)
        }
        accxn = Math.idiv(accx, 6)
        accyn = Math.idiv(accy, 6)
        accsn = Math.idiv(accs, 6)
        soundExpression.slide.playUntilDone()
        clear()
        stop = false
        booom = false
    }
    
    /**
    * Abort shake monitoring.
    */  
    //% blockId=ExpSense_stop block="Abort shake monitoring"
    export function stopMonitoring(): void {
        stop = true
        booom = false
    }

    /**
     * Increase the difficulty level
    **/
    //% blockId=ExpSense_incdiff block="difficulty increase"
    export function difficultyInc(): void {
        if (stop) {
            deltamodifier = Math.constrain(deltamodifier - 0.1, 0.8, 2.8)
        }
    }

    /**
    * Reduce the difficulty level
    **/
    //% blockId=ExpSense_decdiff block="difficulty reduce"
    export function difficultyDec(): void {
        if (stop) {
            deltamodifier = Math.constrain(deltamodifier + 0.1, 0.8, 2.8)
        }
    }

    /**
     * Return the difficulty level
    **/
    //% blockId=ExpSense_getdiff block="get difficulty"
    export function difficultyGet(): number {
        return deltamodifier * 10
    }

}