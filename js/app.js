/**
 * Created by Stas on 23.01.2019.
 */
$(document).ready(function () {
    const head = $("head");

    // Initialize stepper script
    const stepper = new Stepper($('.bs-stepper')[0])

    // get buttons
    const stepForward = $('#stepOneComplete, #stepTwoComplete'),
        stepBack = $('#stepOneBack, #stepTwoBack'),
        prepareButton = $('#prepare'),
        printButton = $('#print')

    // required fields
    const requiredInput = $('input.required')

    // fields to calculate
    const bankName = $('#bankName'),
        totalCapacity = $('#totalCapacity'),
        currentBalance = $('#currentBalance'),
        monthlyPercent = $('#monthlyPercent'),
        monthlyCommission = $('#monthlyCommission')

    // output elements
    const bankInfo = $('#bankInfo'),
        limitInfo = $('#limitInfo'),
        currentBalanceInfo = $('#currentBalanceInfo'),
        monthlyPercentInfo = $('#monthlyPercentInfo'),
        monthlyCommissionInfo = $('#monthlyCommissionInfo'),
        monthlyContributionInfo = $('#monthlyContributionInfo'),
        monthToCompleteInfo = $('#monthToCompleteInfo'),
        completeBalanceInfo = $('#completeBalanceInfo'),
        calcTime = $('#calcTime'),
        calcTable = $('#calcTable')

    let completedFirst = false,
        completedSecond = false

    stepForward.click(function () {
        if (!completedFirst) {
            completedFirst = true
        }
        else {
            completedFirst = true
            completedSecond = true
        }
        stepper.next()
    })

    stepBack.click(function () {
        if (completedFirst) {
            completedFirst = false
        }
        else {
            completedFirst = false
            completedSecond = true
        }
        stepper.previous()
    })

    requiredInput.on("change paste keyup", function () {
        let fields = $(this).closest('.content').find('input.required')

        $.each(fields, function () {
            if (parseFloat($(this).val()) > 0) {
                $(this).parent().siblings('.btn-primary').prop("disabled", false);
            } else {
                $(this).parent().siblings('.btn-primary').prop("disabled", true);
            }
        })
    })


    const calculateMonths = (limit, current, percent, commission = 0, contribution) => {
        let months = 1,
            card,
            thisTable = calcTable.find('tbody'),
            newRow
        if (limit > 0 && contribution > 0 && percent > 0) {
            thisTable.empty()
            while (parseFloat(current) <= parseFloat(limit)) {
                newRow = thisTable.append("<tr/>")
                newRow.append('<td>' + months + '</td>') // months column
                newRow.append('<td>' + parseFloat(current).toFixed(2) + '</td>') // begin column
                card = (parseFloat(current) + parseFloat(contribution)).toFixed(2)
                newRow.append('<td>' + parseFloat(card).toFixed(2) + '</td>') // income column
                card -= ((parseFloat(limit) - parseFloat(current)) * parseFloat(percent) / 100).toFixed(2)
                newRow.append('<td>' + ((parseFloat(limit) - parseFloat(current)) * parseFloat(percent) / 100).toFixed(2) + '</td>') // percent column
                card -= parseFloat(commission).toFixed(2)
                newRow.append('<td>' + parseFloat(commission).toFixed(2) + '</td>') // commission column
                current = card
                newRow.append('<td>' + parseFloat(current).toFixed(2) + '</td>') // end column
                months++
                if ((current + parseFloat(contribution)) >= parseFloat(limit)) {
                    completeBalanceInfo.text(((current) - (parseFloat(limit)).toFixed(2)).toFixed(2))
                }
            }
        }
        return months - 1
    }

    let $stepSlider = $('#slider'),
        start = $stepSlider.data('start'),
        step = $stepSlider.data('step'),
        min = $stepSlider.data('min'),
        max = $stepSlider.data('max'),
        getSlider = document.getElementById('noUISlider');

    bankName.change(function () {
        bankInfo.text($(this).val())
    })

    totalCapacity.change(function () {
        limitInfo.text($(this).val())
        let thisMax = Math.floor($(this).val());
        console.log(`max: ${thisMax}`);
        getSlider.noUiSlider.updateOptions({
            range: {
                'min': [min],
                'max': [thisMax]
            }
        });
    })

    currentBalance.change(function () {
        currentBalanceInfo.text($(this).val())
        let thisMin = Math.floor(totalCapacity.val() / 10),
            thisMax = Math.floor(totalCapacity.val())
        //console.log(`Min: ${thisMin}, max: ${thisMax}`);
        getSlider.noUiSlider.updateOptions({
            range: {
                'min': [thisMin],
                'max': [thisMax]
            }
        });
    })

    monthlyPercent.change(function () {
        monthlyPercentInfo.text($(this).val() + '%')
        let thisMin = Math.round((totalCapacity.val() - currentBalance.val()) * $(this).val() / 12 / 100),
            thisMax = Math.floor(totalCapacity.val())
        //console.log(`Percentage change. Min: ${thisMin}, max: ${thisMax}`);
        getSlider.noUiSlider.updateOptions({
            range: {
                'min': [thisMin + 1], // to prevent infinite loop
                'max': [thisMax]
            }
        });
    })

    monthlyCommission.change(function () {
        monthlyCommissionInfo.text($(this).val())
        let thisMin = Math.floor(((totalCapacity.val() - currentBalance.val()) * monthlyPercent.val() / 12 / 100 ) + parseFloat($(this).val())),
            thisMax = Math.floor(totalCapacity.val())
        //console.log(`Commission change. Min: ${thisMin}, max: ${thisMax}`);
        getSlider.noUiSlider.updateOptions({
            range: {
                'min': [thisMin + 1],
                'max': [thisMax]
            }
        });
    })

    noUiSlider.create(getSlider, {
        start: start,
        step: step,
        range: {
            'min': [min],
            'max': [max]
        }
    });

    const stepSliderValueElement = $('#sliderValue');

    getSlider.noUiSlider.on('update', function (values, handle) {
        let limit = parseFloat(totalCapacity.val()).toFixed(2),
            percent = parseFloat(monthlyPercent.val() / 12).toFixed(2),
            commission = parseFloat(monthlyCommission.val()).toFixed(2),
            current = parseFloat(currentBalance.val()).toFixed(2),
            contribution = values[handle];
        //console.log('sending: ', limit, current, percent, commission, contribution);
        stepSliderValueElement.val(contribution);
        monthlyContributionInfo.text(contribution);
        monthToCompleteInfo.text(calculateMonths(limit, current, percent, commission, contribution));
    });

    stepSliderValueElement.on("change", function () {
        getSlider.noUiSlider.set(this.value)
    })

    prepareButton.click(function (e) {
        e.preventDefault()
        calcTime.toggleClass('d-block d-none')
        calcTable.toggleClass('d-block d-none')
        if (calcTable.hasClass('d-block')) {
            $(this).text('Рахувати')
            printButton.prop('disabled', false)
        } else {
            $(this).text('Підготувати')
            printButton.prop('disabled', true)
        }
    })

    printButton.click(function () {
        window.print()
        return false
    })

    head.append("<link rel='stylesheet' type='text/css' href='css/bootstrap.min.css' />");
    head.append("<link rel='stylesheet' type='text/css' href='css/nouislider.min.css' />");
    head.append("<link rel='stylesheet' type='text/css' href='https://unpkg.com/bs-stepper/dist/css/bs-stepper.min.css' />");
    head.append("<link rel='stylesheet' type='text/css' href='css/styles.css' />");

    console.log('Built...');
})