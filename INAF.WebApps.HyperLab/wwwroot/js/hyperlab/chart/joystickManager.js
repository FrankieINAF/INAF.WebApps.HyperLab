var staticJoystick;
var isJoystickContainerPositionAdjusted = false; // Flag to check if the joystick container position has been adjusted
var repeatMovePointerUp, repeatMovePointerDown, repeatMovePointerLeft, repeatMovePointerRight;

var targetPointer = $('#targetPointer');
var targetPointerSemiWidth = parseInt(targetPointer.width() / 2);

var isJoystickVisible = false;

var currentX = 0;
var currentY = 0;
var speedFactor = 0.05; // Lower = slower movement

var DISTANCE_FROM_SPECTRUM_PX_EXTERNAL = 18;
var DISTANCE_FROM_SPECTRUM_PX_MIDDLE = 12;
var DISTANCE_FROM_SPECTRUM_PX_INTERNAL = 6;

var GoodSeriesPoint = {
    Name: '', // series name
    ValueField: '',
    X: 0, // argument value
    Y: 0, // value (y-axis) value
    MousePosX: 0, // mouse position x
    MousePosY: 0 // mouse position y
};

function initJoystickManager() {
    /* move up */
    $('#buttonMovePointerUp').on('mousedown touchstart', function () {
        repeatMovePointerUp = setInterval(() => {
            movePointerUp(5);
        }, 100);

    }).on('mouseup mouseleave touchend touchcancel', function () {
        clearInterval(repeatMovePointerUp);
    }).on('contextmenu', function (evt) {
        evt.preventDefault();
    });

    /* move down */
    $('#buttonMovePointerDown').on('mousedown touchstart', function () {
        repeatMovePointerDown = setInterval(() => {
            movePointerDown(5);
        }, 100);

    }).on('mouseup mouseleave touchend touchcancel', function () {
        clearInterval(repeatMovePointerDown);
    }).on('contextmenu', function (evt) {
        evt.preventDefault();
    });

    /* move left */
    $('#buttonMovePointerLeft').on('mousedown touchstart', function () {
        repeatMovePointerLeft = setInterval(() => {
            movePointerLeft(5);
        }, 100);
    }).on('mouseup mouseleave touchend touchcancel', function () {
        clearInterval(repeatMovePointerLeft);
    }).on('contextmenu', function (evt) {
        evt.preventDefault();
    });

    /* move right */
    $('#buttonMovePointerRight').on('mousedown touchstart', function () {
        repeatMovePointerRight = setInterval(() => {
            movePointerRight(5);
        }, 100);
    }).on('mouseup mouseleave touchend touchcancel', function () {
        clearInterval(repeatMovePointerRight);
    }).on('contextmenu', function (evt) {
        evt.preventDefault();
    });
}

/* -------------------------------------------------------------------------------- */
/* CHANGE UI OF POINTER WHEN IN NEARBIES OF ALIGNED SPECTRUM */
/* -------------------------------------------------------------------------------- */
function checkForAlignedSeriesPointsInNearby() {
    const left = targetPointer.position().left + targetPointerSemiWidth;

    let series0;

    try {
        series0 = $("#charts").dxChart('instance').series[0];
    }
    catch (e) {
        console.error('Error getting chart series:', e);
        return;
    }

    /* find wavelength value for pointer */
    const xAxisTranslator = series0.getArgumentAxis().getTranslator();
    let chartX = xAxisTranslator.from(left);
    chartX = parseInt(chartX);

    /* test series */
    const series = dxChartGetAllSeries(chartContainer);
    const seriesNum = series.length;
    for (var i = 0; i < seriesNum; i++) {
        let spectrum = getSpectrumBySeriesName(series[i].name);
        if (!spectrum)
            continue;

        if (spectrum.SpectrumType != SPECTRUM_TYPE_ALIGNED)
            continue;

        const points = series[i].getPointsByArg(chartX);
        if (!points || points.length == 0)
            continue;

        /* retrieve y-value for found point */
        const yValue = points[0].value;

        /* find y-value position for pointer */
        const top = targetPointer.position().top + targetPointerSemiWidth;
        const yAxisTranslator = series0.getValueAxis().getTranslator();
        const chartY = yAxisTranslator.from(top);

        /* update position of pointer on joystick UI */
        updatePositionLabel(chartX, chartY);

        /* check if pointer is in the nearbies of the spectrum (compare pointer position chartY against found value yValue) */
        /* test narrowest range */
        if (checkDistanceAndUpdatePointer(chartY, yValue, yAxisTranslator, DISTANCE_FROM_SPECTRUM_PX_INTERNAL, 'internal')) {
            /* set the button for adding fit point enabled */
            setButtonForAddingFitPointEnabled(true);
            /* remember the point coords and the series name for eventually adding a point for fit */
            var xoffset = $('#divMenu').width(); // we need to calculate the offset due to the divMenu to get the correct mouse position
            var yoffset = $('#appbar').height(); // we need to calculate the offset due to the appbar to get the correct mouse position
            GoodSeriesPoint = {
                Name: series[i].name,
                ValueField: series[i].getValueFields()[0],
                X: chartX,
                Y: yValue,
                MousePosX: left + xoffset,
                MousePosY: top + yoffset
            };
            /* hide other circles */
            $('#centerDotExternal').removeClass('center-dot-external-visible');
            $('#centerDotMiddle').removeClass('center-dot-middle-visible');
            return;
        }

        /* test middle range */
        if (checkDistanceAndUpdatePointer(chartY, yValue, yAxisTranslator, DISTANCE_FROM_SPECTRUM_PX_MIDDLE, 'middle')) {
            /* set the button for adding fit point disnabled */
            setButtonForAddingFitPointEnabled(false);
            /* hide other circles */
            $('#centerDotExternal').removeClass('center-dot-external-visible');
            $('#centerDotInternal').removeClass('center-dot-internal-visible');
            return;
        }

        /* test widest range */
        if (checkDistanceAndUpdatePointer(chartY, yValue, yAxisTranslator, DISTANCE_FROM_SPECTRUM_PX_EXTERNAL, 'external')) {
            /* set the button for adding fit point disnabled */
            setButtonForAddingFitPointEnabled(false);
            /* hide other circles */
            $('#centerDotMiddle').removeClass('center-dot-middle-visible');
            $('#centerDotInternal').removeClass('center-dot-internal-visible');
        }
    }
}

function checkDistanceAndUpdatePointer(chartY, yValue, yAxisTranslator, distance, distanceFlag) {
    const yValueInPixel = parseInt(yAxisTranslator.to(yValue));

    const yValueMin = yAxisTranslator.from(yValueInPixel + distance);
    const yValueMax = yAxisTranslator.from(yValueInPixel - distance);

    /* test condition: if satisfied apply the visible class, otherwise remove it */
    const condition = chartY >= yValueMin && chartY <= yValueMax;
    if (condition)
        $(`#centerDot${firstLetterUpperCase(distanceFlag)}`).addClass(`center-dot-${distanceFlag}-visible`);
    else
        $(`#centerDot${firstLetterUpperCase(distanceFlag)}`).removeClass(`center-dot-${distanceFlag}-visible`);

    return condition;
}

function setButtonForAddingFitPointEnabled(isEnabled) {
    const button = $('#buttonJoystickAddFitPoint');
    if (isEnabled) {
        button.removeClass('disabled');
    } else {
        button.addClass('disabled');
    }
}

function setJoystickVisible(isVisible) {
    if (isVisible) {
        $('#joystickMainContainer').addClass('d-flex').removeClass('d-none');

        if (!isJoystickContainerPositionAdjusted) {
            adjustJoystickContainerPosition(); // Adjust position only once
            isJoystickContainerPositionAdjusted = true;
        }
    } else {
        $('#joystickMainContainer').removeClass('d-flex').addClass('d-none');
    }
}

/* -------------------------------------------------------------------------------- */
/* MANAGE CREATION OF A FIT POINT */
/* -------------------------------------------------------------------------------- */
function addFitPoint() {
    if (!GoodSeriesPoint || !GoodSeriesPoint.Name || GoodSeriesPoint.X == 0 || GoodSeriesPoint.Y == 0 || GoodSeriesPoint.MousePosX == 0 || GoodSeriesPoint.MousePosY == 0) {
        console.warn('No good series point found to add a fit point.');
        return;
    }

    const series = dxChartGetAllSeries(chartContainer);
    if (!series || series.length == 0) {
        console.warn('No series found in the chart container.');
        return;
    }
    const selectedSeries = series.filter(s => s.name == GoodSeriesPoint.Name);
    if (!selectedSeries || selectedSeries.length == 0) {
        console.warn(`No series found with the name ${GoodSeriesPoint.Name}.`);
        return;
    }

    const point = createSimplePoint(GoodSeriesPoint.X, GoodSeriesPoint.Y);
    addRemoveSelectedPointForFittingProcedure(GoodSeriesPoint.ValueField, point, GoodSeriesPoint.MousePosX, GoodSeriesPoint.MousePosY);
    //const seriesNum = series.length;
    //for (var i = 0; i < seriesNum; i++) {
    //    if (series[i].name === goodSeriesPoint.name) {
    //        // Add the point to the series
    //        series[i].addPoint(goodSeriesPoint.x, goodSeriesPoint.y);
    //        console.log(`Added fit point to series ${goodSeriesPoint.name} at (${goodSeriesPoint.x}, ${goodSeriesPoint.y})`);
    //        break;
    //    }
    //}
    // Reset the good series point
    GoodSeriesPoint = null;
}

/* -------------------------------------------------------------------------------- */
/* UPDATE JOYSTICK UI */
/* -------------------------------------------------------------------------------- */
function adjustJoystickContainerPosition() {
    const chartsOffset = $('#charts').offset();
    const chartsPosition = $('#charts').position();
    const chartsWidth = $('#charts').width();

    const joystickMainContainerWidth = $('#joystickMainContainer').width();

    const left = ((chartsWidth - joystickMainContainerWidth) / 2) + chartsOffset.left;
    $('#joystickMainContainer').css(`left`, `${left}px`);
}

function toggleJoystickContainer() {
    if (!isJoystickVisible) {
        const callback = executeAfter(function () {
            $('#targetPointer').removeClass('d-none');
            animateCSS('targetPointer', 'fadeIn');

            $('#joystickVisualizationIcon').removeClass('mif-expand-less').addClass('mif-expand-more');
        }, 500);
        slideInUp('#joystickMainContainer', 220, 250, callback);
    } else {
        const callback = executeAfter(function () {
            const fadeoutCallback = function () {
                $('#targetPointer').addClass('d-none');
            };
            animateCSS('targetPointer', 'fadeOut', FASTER, fadeoutCallback);


            $('#joystickVisualizationIcon').removeClass('mif-expand-more').addClass('mif-expand-less');
        }, 500);
        slideOutDown('#joystickMainContainer', 220, 250, callback);
    }

    isJoystickVisible = !isJoystickVisible;
}

function updatePositionLabel(x, y) {
    // Format y to 3 decimal places
    var yFormatted = (typeof y === 'number') ? y.toFixed(3) : y;
    $('#joystickPositionValue').text(JoystickPositionValue.replace('r_v1', x).replace('r_v2', yFormatted));
}

/* -------------------------------------------------------------------------------- */
/* MANAGE MOVEMENT OF POINTER */
/* -------------------------------------------------------------------------------- */
function movePointerUp(increment) {
    if (increment === undefined)
        increment = 10;

    //console.log(`Moving pointer up by ${increment}px from ${currentY}px`);
    if (targetPointer && targetPointer.length) {
        currentY -= increment; // Move up by specified increment
        targetPointer.css('transform', `translate(${currentX}px, ${currentY}px)`);
        checkForAlignedSeriesPointsInNearby();
    }
}

function movePointerDown(increment) {
    if (increment === undefined)
        increment = 10;

    if (targetPointer && targetPointer.length) {
        currentY += increment; // Move down by specified increment
        targetPointer.css('transform', `translate(${currentX}px, ${currentY}px)`);
        checkForAlignedSeriesPointsInNearby();
    }
}

function movePointerLeft(increment) {
    if (increment === undefined)
        increment = 10;

    if (targetPointer && targetPointer.length) {
        currentX -= increment; // Move left by specified increment
        targetPointer.css('transform', `translate(${currentX}px, ${currentY}px)`);
        checkForAlignedSeriesPointsInNearby();
    }
}

function movePointerRight(increment) {
    if (increment === undefined)
        increment = 10;

    if (targetPointer && targetPointer.length) {
        currentX += increment; // Move right by specified increment
        targetPointer.css('transform', `translate(${currentX}px, ${currentY}px)`);
        checkForAlignedSeriesPointsInNearby();
    }
}

/* -------------------------------------------------------------------------------- */
/* RESET POSITION OF POINTER */
/* -------------------------------------------------------------------------------- */
function resetPointerPosition() {
    currentX = 0;
    currentY = 0;
    targetPointer.css('transform', `translate(${currentX}px, ${currentY}px)`);
    updatePositionLabel(currentX, currentY);
}