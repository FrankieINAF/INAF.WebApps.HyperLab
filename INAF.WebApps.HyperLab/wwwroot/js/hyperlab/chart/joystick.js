const staticJoystick = new JoystickController(
    {
        maxRange: 70,
        level: 10,
        radius: 50,
        joystickRadius: 30,
        opacity: 0.5,
        leftToRight: false,
        bottomToUp: true,
        containerClass: "joystick-container",
        controllerClass: "joystick-controller",
        joystickClass: "joystick",
        distortion: true,
        x: "25%",
        y: "25%",
        mouseClickButton: "ALL",
        hideContextMenu: false,
    },
    ({ x, y, leveledX, leveledY, distance, angle }) =>
        console.log(x, y, leveledX, leveledY, distance, angle)
);
