/**
 * PTV Timetable V1.0
 * Run on Scriptable
 * Created by Ricky Li on 2022/12/09
 * https://github.com/imchlorine/PTVTimetable.git
 * This Script is used for feching PTV timetable for specific route
 * You can always duplicate this Script to add multiple timetable for iOS Stack Widget
 * 
 * For fetching Myki Balance Widget visit:
 * https://github.com/imchlorine/MykiBalance.git
 * 
 * 
 * Important! This Widget is not affiliated to PTV or Myki. For personal use only.
 */

// =============================
// [routeType] All the options from below
// Train: 0
// Tram: 1
// Bus: 2
// Vline: 3
// Night Bus: 4

// [routeName] Can be Train line, Tram route, Bus route
// Train: eg. "Alamein", "Belgrave", "Craigieburn", "Cranbourne" etc.
// Bus: eg. "200", "207", "900" etc.
// Tram: eg. "1", "3-3a", "96" etc.

// [fromStop] Your Departure Stop Name
// [toStop] Your Arriving Stop Name
// Go PTV App or website to find stop name.

// Here is an example for Tram Route 1 from "Melbourne University/Swanston St #1" to "Federation Square/Swanston St #13"
// Please change the value inside " " below to customize your PTV timetable. 
const routeType = "1"
const routeName = "1"
const fromStop = "Melbourne University/Swanston St #1"
const toStop = "Federation Square/Swanston St #13"






// ================================
// ================================
// Do not edit the code below
const baseURL = "https://www.ptv.vic.gov.au/lithe";
let token = await getToken()
let stopDep = await searchStop(fromStop)
let stopDes = await searchStop(toStop)
let route = await getRoute()
let services = await getStopServices(stopDep.id, route.id)
let direction = await getDirection()
let departures = getDepartures(direction)
let widget = await createWidget(departures);
if (!config.runsInWidget) {
    await widget.presentMedium()
}
Script.setWidget(widget)
Script.complete()

async function createWidget(departures) {
    let typeColor = getRouteColor(routeType)
    let typeIcon = getRouteSymb(routeType)
    let widget = new ListWidget()
    let startColor = new Color("333434")
    let midColor = new Color("333434")
    let endColor = new Color("#ffffff")
    let gradient = new LinearGradient()
    gradient.colors = [startColor, midColor, endColor]
    gradient.locations = [0.0, 0.53, 0.53]
    widget.backgroundGradient = gradient
    widget.addSpacer()
    addTextWithStyle({
        stack: widget,
        text: fromStop,
        size: 22
    })

    let endWidget = widget.addStack()

    addSymbol({
        symbol: typeIcon,
        stack: endWidget,
        color: typeColor
    })

    endWidget.addSpacer(25)
    addTextWithStyle({
        stack: endWidget,
        text: "to " + toStop,
        size: 18
    })

    addTextWithStyle({
        stack: widget,
        text: "Route " + route.label,
        color: getRouteColor(routeType)
    })
    widget.addSpacer(15)

    let routeWidget = widget.addStack();
    routeWidget.addSpacer(10);

    for (const dep of departures) {
        console.log(dep)
        let depWidget = widget.addStack();
        var platText = dep["platform_number"]
        if (platText != null) platText = "Platform " + platText;

        addTextWithStyle({
            stack: depWidget,
            text: platText ?? "",
            color: "#000000"
        })
        if (platText != null) depWidget.addSpacer(20)
        var scheduledTime = dep["scheduled_departure_utc"]
        var estimatedTime = dep["estimated_departure_utc"]
        var minText = "";
        let dif = new Date(estimatedTime ?? scheduledTime).getTime() - new Date().getTime();
        let time = Math.round(dif / 60000)
        let min = time == 1 ? " min" : " mins"
        minText = time + min
        let dateText = new Date(scheduledTime)
        let localTime = new Date(dateText)
        if (new Date().toDateString() != localTime.toDateString()) {
            let df = new DateFormatter()
            df.useMediumDateStyle()
            minText = df.string(localTime).slice(0, -4)
        }
        if (time < 60) minText = time + min
        if (time === 0) minText = "Now"
        let depText = "Scheduled " + ("0" + localTime.getHours()).slice(-2) + ":" + ("0" + localTime.getMinutes()).slice(-2)
        addTextWithStyle({
            stack: depWidget,
            text: depText,
            color: "#000000"
        })
        depWidget.addSpacer(15)
        let isExpress = dep.run["express_stop_count"]
        addTextWithStyle({
            stack: depWidget,
            text: isExpress > 0 ? "EXPRESS" : "",
            color: "#88BC41",
        })

        depWidget.addSpacer()
        addTextWithStyle({
            stack: depWidget,
            text: minText,
            color: "#88BC41"
        })
        widget.addSpacer()
    }
    let df = new DateFormatter()
    df.useShortTimeStyle()
    let updated = df.string(new Date())

    addTextWithStyle({
        stack: widget,
        text: "Last updated at " + updated,
        size: 10,
        color: "#000000"
    })

    return widget
}

function getRouteColor(routeType) {
    var color = ""
    switch (routeType) {
        case "0":
            color = "#3070C7"
            break;
        case "1":
            color = "#88BC41"
            break;
        case "2":
            color = "#EF8933"
            break;
        case "3":
            color = "#832690"
            break;
        case "4":
            color = "#ffffff"
            break;
        default:
            color = "#ffffff"
            break;
    }
    return color;
}

function getRouteSymb(routeType) {
    var icon = "tram"
    switch (routeType) {
        case "0":
        case "3":
            icon = "tram.fill"
            break;
        case "1":
            icon = "tram"
            break;
        case "2":
        case "4":
            icon = "bus"
            break;
        default:
            icon = "tram"
            break;
    }
    return icon;
}

function addSymbol({
    stack,
    symbol = 'applelogo',
    color = "#ffffff",
    size = 20,
}) {
    const _sym = SFSymbol.named(symbol)
    const wImg = stack.addImage(_sym.image)
    wImg.tintColor = new Color(color)
    wImg.imageSize = new Size(size, size)
}

function addTextWithStyle({
    stack,
    text,
    size = 12,
    color = "#ffffff"
}) {
    const textwidget = stack.addText(text)
    textwidget.textColor = new Color(color)
    textwidget.font = new Font("AppleSDGothicNeo-Bold", size)
    return textwidget
}

function getDepartures(direction) {
    let departures = services["departures"].filter(departure => departure["direction_id"] === direction["direction_id"])
    return departures
}

async function getDirection() {
    let directions = Object.values(services["directions"])
    let direct0 = directions[0]
    let stopSeq = await getStopSeq(routeType, route.id, direct0["direction_id"])
    let stopDepIndex = stopSeq.findIndex(stop => stop.id === stopDep.id)
    let stopDesIndex = stopSeq.findIndex(stop => stop.id === stopDes.id)
    if (stopDepIndex < stopDesIndex) return direct0
    return directions[1]
}



async function getRoute() {
    let uri = `/routes?route_type=${routeType}&`
    let result = await apiRequest(uri)
    let route = result["routes"].find((r) => r["short_label"] === routeName);
    return route
}

async function searchStop(stopName) {
    let queryName = encodeURIComponent(stopName)
    let uri = `/search?term=${queryName}&mode=home&`
    let result = await apiRequest(uri)
    // Why PTV API return data type is not consistent??????????????
    let stop = result["results"]["stop"]
    if (Array.isArray(stop)) {
        return result["results"]["stop"][0][0]
    }
    return result["results"]["stop"][routeType][0]
}

async function getStopServices(stopId, routeId) {
    let uri = `/stop-services?stop_id=${stopId}&route_id=${routeId}&mode_id=${routeType}&max_results=2&look_backwards=false&`
    let result = await apiRequest(uri)
    return result
}

async function getStopSeq(routeType, routeId, directionId) {
    let utcTime = new Date().getUTCDate()
    let uri = `/route-stops?route_type=${routeType}&route_id=${routeId}&direction_id=${directionId}&`
    let result = await apiRequest(uri)
    return result["stops_pattern"]
}

function getDirectionIdFromDes(depId, desId, depSeq, desSeq) {
    if (depSeq["seqs"][depId] < desSeq["seqs"][desId]) return depSeq["directions"]
    return desSeq["directions"]
}

async function getToken() {
    let url = "https://www.ptv.vic.gov.au"
    let req = new Request(url)
    let result = await req.loadString()
    let token = result.match(/"fetch-key" value="([^"]+)"/)[1]
    return token
}

async function apiRequest(uri) {
    let encodedUri = encodeURI(uri)
    let url = baseURL + encodedUri + `__tok=${token}`
    let req = new Request(url)
    let result = await req.loadString()
    let jsonResult = JSON.parse(result)
    return jsonResult
}